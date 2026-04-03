import { generateJSON } from "./provider";
import { buildRankingPrompt, PROMPT_VERSION } from "./prompts";
import { scoreCandidatesBatch, type ScoringOutput } from "./scorer";
import { aiRankingResponseSchema } from "@/lib/validators/schemas";
import { withRetry } from "@/lib/utils/rate-limiter";
import dbConnect from "@/lib/db/mongodb";
import Job, { type IJob } from "@/lib/db/models/Job";
import Candidate, { type ICandidate } from "@/lib/db/models/Candidate";
import ScreeningResult from "@/lib/db/models/ScreeningResult";
import ScreeningSession from "@/lib/db/models/ScreeningSession";

export async function runScreeningPipeline(sessionId: string): Promise<void> {
  await dbConnect();

  const session = await ScreeningSession.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const job = await Job.findById(session.jobId);
  if (!job) throw new Error("Job not found");

  const candidates = await Candidate.find({ jobId: job._id });
  if (candidates.length === 0) throw new Error("No candidates to screen");

  try {
    session.status = "processing";
    await session.save();

    await Job.findByIdAndUpdate(job._id, { status: "screening" });

    // Stage 2: Individual scoring
    const scoringInputs = candidates.map((c: ICandidate) => ({
      candidateId: c._id.toString(),
      candidateProfile: c.profile as unknown as Record<string, unknown>,
      jobRequirements: job.requirements as unknown as Record<string, unknown>,
      jobPreferences: job.preferences as unknown as Record<string, unknown>,
      screeningConfig: job.screeningConfig as unknown as Record<string, unknown>,
    }));

    const { results: scoringResults, errors: scoringErrors } =
      await scoreCandidatesBatch(scoringInputs);

    session.processedCandidates = scoringResults.length;
    await session.save();

    if (scoringResults.length === 0) {
      throw new Error("All candidates failed scoring");
    }

    // Stage 3: Comparative ranking
    const jobContext = `${job.title} at ${job.company}. Required skills: ${job.requirements.skills.join(", ")}. Experience: ${job.requirements.experience.min}-${job.requirements.experience.max} years.`;

    const candidateSummaries = scoringResults.map((r: ScoringOutput) => {
      const candidate = candidates.find((c: ICandidate) => c._id.toString() === r.candidateId);
      return {
        candidateId: r.candidateId,
        name: candidate?.profile.name || "Unknown",
        overallScore: r.overallScore,
        strengths: r.strengths,
        gaps: r.gaps,
      };
    });

    const rankingPrompt = buildRankingPrompt(
      jobContext,
      candidateSummaries,
      session.shortlistSize
    );

    let rankingProvider = "unknown";
    let rankings: Array<{ candidateId: string; adjustedScore: number; rank: number }> = [];

    try {
      const rawRanking = await withRetry(async () => {
        const response = await generateJSON(rankingPrompt, "smart");
        rankingProvider = `${response.provider}/${response.model}`;
        console.log(`[AI Orchestrator] Ranking via ${rankingProvider}`);
        return JSON.parse(response.text);
      });

      // Fix #3: Validate ranking response with Zod
      const rankingParsed = aiRankingResponseSchema.safeParse(rawRanking);
      if (rankingParsed.success) {
        rankings = rankingParsed.data.rankings;
      } else {
        console.warn("[AI Orchestrator] Ranking validation failed, using score-based ordering:", rankingParsed.error);
      }
    } catch (rankingError) {
      console.warn("[AI Orchestrator] Ranking stage failed, falling back to score-based ordering:", rankingError);
    }

    // Determine which AI was used for scoring
    const scoringProvider = scoringResults[0]?.aiProvider
      ? `${scoringResults[0].aiProvider}/${scoringResults[0].aiModel}`
      : "unknown";

    // Build result docs
    const resultDocs = scoringResults.map((scored: ScoringOutput) => {
      const ranking = rankings.find(
        (r) => r.candidateId === scored.candidateId
      );
      const finalScore = ranking ? ranking.adjustedScore : scored.overallScore;
      const rank = ranking ? ranking.rank : 0;

      return {
        jobId: job._id,
        candidateId: scored.candidateId,
        sessionId: session._id,
        overallScore: finalScore,
        breakdown: scored.breakdown,
        rank,
        strengths: scored.strengths,
        gaps: scored.gaps,
        recommendation: scored.recommendation,
        reasoning: scored.reasoning,
        confidenceScore: scored.confidenceScore,
        recruiterDecision: "pending",
        aiModel: `scoring:${scoringProvider} ranking:${rankingProvider}`,
        promptVersion: PROMPT_VERSION,
        processingTimeMs: scored.processingTimeMs,
      };
    });

    // Fix #22: Sort with tiebreaker for deterministic ordering
    resultDocs.sort(
      (a: { overallScore: number; candidateId: string }, b: { overallScore: number; candidateId: string }) => {
        if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
        return a.candidateId.localeCompare(b.candidateId);
      }
    );
    resultDocs.forEach(
      (doc: { rank: number }, idx: number) => {
        if (!doc.rank) doc.rank = idx + 1;
      }
    );

    // Fix #2: Delete AFTER building results, right before insert (atomic-ish swap)
    await ScreeningResult.deleteMany({ jobId: job._id });
    await ScreeningResult.insertMany(resultDocs);

    // Update session
    session.status = "completed";
    session.completedAt = new Date();
    session.processedCandidates = scoringResults.length;
    if (scoringErrors.length > 0) {
      session.error = `${scoringErrors.length} candidate(s) failed scoring`;
    }
    await session.save();

    await Job.findByIdAndUpdate(job._id, { status: "open" });
  } catch (error) {
    session.status = "failed";
    session.error = (error as Error).message;
    await session.save();
    await Job.findByIdAndUpdate(job._id, { status: "open" });
    throw error;
  }
}
