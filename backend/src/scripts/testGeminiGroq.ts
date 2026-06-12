import "../config/env.js"
import { geminiProvider } from "../ai/gemini.provider.js"
import { groqProvider } from "../ai/groq.provider.js"

const geminiOutput=await geminiProvider.generateText("Hi");
console.log(`Gemini Response:${geminiOutput}`);
const groqOutput=await groqProvider.generateText("Hi");
console.log(`Groq Response:${groqOutput}`);

