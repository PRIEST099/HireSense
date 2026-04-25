// ============================================================================
// CLAUDE API — DISABLED
// ----------------------------------------------------------------------------
// Claude is temporarily commented out; HireSense uses Gemini exclusively.
// The full implementation is preserved below so we can re-enable the
// Anthropic fallback by uncommenting the block.
//
// To re-enable:
//   1. Uncomment the block below.
//   2. Remove the two "disabled stub" exports at the bottom of this file.
//   3. Re-enable the Claude branch in src/lib/ai/provider.ts.
//   4. Set CLAUDE_API_KEY in .env.local.
// ============================================================================

/*
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("CLAUDE_API_KEY is not set");
    }
    client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }
  return client;
}

export async function claudeGenerateJSON(prompt: string, model: "fast" | "smart" = "fast"): Promise<string> {
  const anthropic = getClient();
  const modelId = model === "smart" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";

  console.log(`[Claude] Using ${modelId}`);

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation.",
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Strip markdown code blocks if present
  let text = textBlock.text.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return text;
}

export function isClaudeAvailable(): boolean {
  return !!process.env.CLAUDE_API_KEY;
}
*/

// Disabled stubs — present so imports resolve while Claude is turned off.
// `isClaudeAvailable()` always returns false, so the Claude branch in
// `provider.ts` (also commented out) can never fire.
export async function claudeGenerateJSON(_prompt: string, _model: "fast" | "smart" = "fast"): Promise<string> {
  throw new Error("Claude provider is disabled. Re-enable src/lib/ai/claude.ts to use.");
}

export function isClaudeAvailable(): boolean {
  return false;
}
