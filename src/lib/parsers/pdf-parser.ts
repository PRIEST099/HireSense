import { extractText } from "unpdf";
import { generateJSON } from "@/lib/ai/provider";
import { buildResumeParsingPrompt } from "@/lib/ai/prompts";
import { candidateProfileSchema } from "@/lib/validators/schemas";
import { withRetry } from "@/lib/utils/rate-limiter";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer));

  // text is an array of page strings — join them
  const rawText = Array.isArray(text) ? text.join("\n\n") : String(text);

  return rawText.replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function parseResumeWithAI(
  rawText: string,
  jobContext: string
): Promise<{ profile: Record<string, unknown>; parsedByAI: true }> {
  const prompt = buildResumeParsingPrompt(rawText, jobContext);

  const parsed = await withRetry(async () => {
    const response = await generateJSON(prompt, "fast");
    console.log(`[PDF Parser] Used ${response.provider}/${response.model}`);
    const json = JSON.parse(response.text);
    return candidateProfileSchema.parse(json);
  });

  return { profile: parsed as unknown as Record<string, unknown>, parsedByAI: true };
}
