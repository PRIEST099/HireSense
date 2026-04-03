import { generateJSON } from "./provider";
import { buildRankingPrompt, PROMPT_VERSION } from "./prompts";
import { scoreCandidatesBatch, type ScoringOutput } from "./scorer";
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
    const rankingResult = await withRetry(async () => {
      const response = await generateJSON(rankingPrompt, "smart");
      rankingProvider = `${response.provider}/${response.model}`;
      console.log(`[AI Orchestrator] Ranking via ${rankingProvider}`);
      return JSON.parse(response.text);
    });

    // Delete previous results for this job
    await ScreeningResult.deleteMany({ jobId: job._id });

    // Determine which AI was used for scoring
    const scoringProvider = scoringResults[0]?.aiProvider
      ? `${scoringResults[0].aiProvider}/${scoringResults[0].aiModel}`
      : "unknown";

    // Save results with final rankings
    const rankings = rankingResult.rankings || [];
    const resultDocs = scoringResults.map((scored: ScoringOutput) => {
      const ranking = rankings.find(
        (r: { candidateId: string }) => r.candidateId === scored.candidateId
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

    // Sort by score and assign ranks if ranking stage failed
    resultDocs.sort(
      (a: { overallScore: number }, b: { overallScore: number }) =>
        b.overallScore - a.overallScore
    );
    resultDocs.forEach(
      (doc: { rank: number }, idx: number) => {
        if (!doc.rank) doc.rank = idx + 1;
      }
    );

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
