import { generateJSON } from "./provider";
import { buildScoringPrompt } from "./prompts";
import { aiScoringResponseSchema } from "@/lib/validators/schemas";
import { withRetry } from "@/lib/utils/rate-limiter";

export interface ScoringInput {
  candidateId: string;
  candidateProfile: Record<string, unknown>;
  jobRequirements: Record<string, unknown>;
  jobPreferences: Record<string, unknown>;
  screeningConfig: Record<string, unknown>;
}

export interface ScoringOutput {
  candidateId: string;
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    cultureFitMatch: number;
  };
  strengths: string[];
  gaps: string[];
  recommendation: "strong_match" | "good_match" | "partial_match" | "weak_match";
  reasoning: string;
  confidenceScore: number;
  processingTimeMs: number;
  aiProvider: string;
  aiModel: string;
}

export async function scoreCandidate(input: ScoringInput): Promise<ScoringOutput> {
  const start = Date.now();

  const prompt = buildScoringPrompt(
    input.jobRequirements,
    input.jobPreferences,
    input.candidateProfile,
    input.screeningConfig
  );

  let provider = "";
  let model = "";

  const result = await withRetry(async () => {
    const response = await generateJSON(prompt, "fast");
    provider = response.provider;
    model = response.model;
    console.log(`[AI Scorer] ${response.provider}/${response.model} response:`, response.text.slice(0, 300));
    const json = JSON.parse(response.text);
    return aiScoringResponseSchema.parse(json);
  });

  return {
    candidateId: input.candidateId,
    ...result,
    processingTimeMs: Date.now() - start,
    aiProvider: provider,
    aiModel: model,
  };
}

export async function scoreCandidatesBatch(
  inputs: ScoringInput[],
  concurrency: number = 3
): Promise<{ results: ScoringOutput[]; errors: Array<{ candidateId: string; error: string }> }> {
  const results: ScoringOutput[] = [];
  const errors: Array<{ candidateId: string; error: string }> = [];

  for (let i = 0; i < inputs.length; i += concurrency) {
    const batch = inputs.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(scoreCandidate));

    settled.forEach((outcome, idx) => {
      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
      } else {
        console.error(`[AI Scorer] Candidate ${batch[idx].candidateId} failed:`, outcome.reason);
        errors.push({
          candidateId: batch[idx].candidateId,
          error: outcome.reason?.message || "Scoring failed",
        });
      }
    });
  }

  return { results, errors };
}
