import { groqClient } from "../config/groq.config.js";

class GroqProvider {
  async generateText(prompt: string): Promise<string> {
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}

export const groqProvider = new GroqProvider();