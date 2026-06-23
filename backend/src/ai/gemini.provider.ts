import { geminiClient } from "../config/gemini.config.js";
import type { Schema } from "@google/generative-ai";

export class GeminiProvider {
  async generateText(systemPrompt: string,
    userPrompt: string): Promise<string> {
    const model = geminiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);

    return result.response.text();
  }

 async generateStructuredJson<T>({
  systemPrompt,
  userPrompt,
  schema,
}: {
  systemPrompt: string;
  userPrompt: string;
  schema: Schema;
}): Promise<T> {
  const model =
    geminiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,

      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

  const result =
    await model.generateContent(
      userPrompt
    );

  const text =
    result.response.text();

  if (!text) {
    throw new Error(
      "Gemini returned empty structured response"
    );
  }

  return JSON.parse(text) as T;
}
}

export const geminiProvider = new GeminiProvider();