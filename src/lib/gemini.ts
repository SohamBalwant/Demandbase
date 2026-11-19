import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;
if (apiKey && apiKey !== "your_api_key_here") {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel(modelName: string = "gemini-3.1-flash-lite") {
  if (!genAI) {
    if (apiKey && apiKey !== "your_api_key_here") {
      genAI = new GoogleGenerativeAI(apiKey);
    } else {
      return null;
    }
  }
  return genAI.getGenerativeModel({ model: modelName });
}

export { genAI };
