import { geminiClient } from "../config/gemini.config.js";

export class GeminiProvider {
  async generateText(prompt: string) {
    const model = geminiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    return result.response.text();
  }
}

export const geminiProvider = new GeminiProvider();