import { flashModel, proModel } from "./gemini";
// Claude fallback is temporarily disabled — see src/lib/ai/claude.ts.
// Imports left in place (but unused) so re-enabling is a single-line change.
import { claudeGenerateJSON, isClaudeAvailable } from "./claude";
import { flashRateLimiter, proRateLimiter } from "@/lib/utils/rate-limiter";

// Silence unused-import warnings while Claude is off. When Claude is
// re-enabled these voids can be removed.
void claudeGenerateJSON;
void isClaudeAvailable;

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

/*
// ============================================================================
// CLAUDE FALLBACK — DISABLED
// ----------------------------------------------------------------------------
// The Claude path below is commented out so HireSense runs Gemini-only.
// Re-enable by:
//   1. Uncommenting this block + the `isClaudeAvailable` branch inside
//      `generateJSON` below.
//   2. Restoring the real implementation in src/lib/ai/claude.ts.
//   3. Setting CLAUDE_API_KEY in .env.local.
// ============================================================================
async function tryClaude(prompt: string, tier: AITier): Promise<GenerateResult> {
  const modelName = tier === "smart" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
  const text = await claudeGenerateJSON(prompt, tier);

  return { text, provider: "claude", model: modelName };
}
*/

/**
 * Generates JSON from a prompt using Gemini.
 * (Claude fallback temporarily disabled — see block comments below.)
 */
export async function generateJSON(prompt: string, tier: AITier = "fast"): Promise<GenerateResult> {
  // Gemini only
  const result = await tryGemini(prompt, tier);
  console.log(`[AI Provider] Gemini (${tier}) succeeded`);
  return result;

  /*
  // ---- Claude fallback (disabled) -----------------------------------------
  try {
    const result = await tryGemini(prompt, tier);
    console.log(`[AI Provider] Gemini (${tier}) succeeded`);
    return result;
  } catch (geminiError) {
    console.warn(`[AI Provider] Gemini (${tier}) failed:`, (geminiError as Error).message);
  }

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
  // -------------------------------------------------------------------------
  */
}
