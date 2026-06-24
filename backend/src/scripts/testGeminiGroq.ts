import "../config/env.js";
import { geminiProvider } from "../ai/gemini.provider.js";
import { groqProvider } from "../ai/groq.provider.js";

const systemPrompt =
  "Reply with exactly one word.";

const userPrompt =
  "Tell me about artificial intelligence.";


const groqOutput =
  await groqProvider.generateText(
    systemPrompt,
    userPrompt
  );

console.log(
  `Groq Response: ${groqOutput}`
);

const geminiOutput=
  await geminiProvider.generateText(
    systemPrompt,
    userPrompt
  );

console.log(
  `Gemini Response: ${geminiOutput}`
);  