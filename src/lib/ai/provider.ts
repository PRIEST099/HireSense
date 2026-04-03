import { flashModel, proModel } from "./gemini";
import { claudeGenerateJSON, isClaudeAvailable } from "./claude";
import { flashRateLimiter, proRateLimiter } from "@/lib/utils/rate-limiter";

export type AITier = "fast" | "smart";

interface GenerateResult {
  text: string;
  provider: "gemini" | "claude";
  model: string;
}

async function tryGemini(prompt: string, tier: AITier): Promise<GenerateResult> {
  const rateLimiter = tier === "smart" ? proRateLimiter : flashRateLimiter;
  await rateLimiter.acquire();

  const model = tier === "smart" ? proModel : flashModel;
  const modelName = tier === "smart" ? "gemini-2.5-pro" : "gemini-2.0-flash";

  const response = await model.generateContent(prompt);
  const text = response.response.text();

  return { text, provider: "gemini", model: modelName };
}

async function tryClaude(prompt: string, tier: AITier): Promise<GenerateResult> {
  const modelName = tier === "smart" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
  const text = await claudeGenerateJSON(prompt, tier);

  return { text, provider: "claude", model: modelName };
}

/**
 * Generates JSON from a prompt using Gemini first, falling back to Claude.
 * Returns the raw text and which provider was used.
 */
export async function generateJSON(prompt: string, tier: AITier = "fast"): Promise<GenerateResult> {
  // Try Gemini first
  try {
    const result = await tryGemini(prompt, tier);
    console.log(`[AI Provider] Gemini (${tier}) succeeded`);
    return result;
  } catch (geminiError) {
    console.warn(`[AI Provider] Gemini (${tier}) failed:`, (geminiError as Error).message);
  }

  // Fallback to Claude
  if (isClaudeAvailable()) {
    try {
      const result = await tryClaude(prompt, tier);
      console.log(`[AI Provider] Claude fallback (${tier}) succeeded`);
      return result;
    } catch (claudeError) {
      console.error(`[AI Provider] Claude (${tier}) also failed:`, (claudeError as Error).message);
      throw new Error(`Both AI providers failed. Gemini and Claude unavailable.`);
    }
  }

  throw new Error("Gemini failed and Claude API key not configured. Set CLAUDE_API_KEY in .env.local as fallback.");
}
