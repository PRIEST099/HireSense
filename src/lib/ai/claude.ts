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
