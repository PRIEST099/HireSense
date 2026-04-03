import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

// Lazy init — won't crash at import if key is missing, only on first use
const genAI = new GoogleGenerativeAI(apiKey);

export const flashModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

export const proModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
  },
});

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export { genAI };
