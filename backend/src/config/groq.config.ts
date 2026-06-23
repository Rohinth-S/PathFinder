import Groq from "groq-sdk";
import "../config/env.js";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing");
}

export const groqClient = new Groq({
  apiKey,
});