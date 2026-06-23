import fs from "fs";
import "../config/env.js";
import { sarvamProvider } from "../ai/sarvam.provider.js";
import { understandQuery } from "../processors/query/understandQuery.processor.js";

async function main() {
  const audioFile = process.argv[2] || "output.wav";
  if (!fs.existsSync(audioFile)) {
    console.log(`Audio file "${audioFile}" not found.`);
    console.log(`Please run "npm run test:sarvam" first to generate "output.wav", or pass a path to a WAV file.`);
    process.exit(1);
  }

  console.log(`Reading audio file: ${audioFile}`);
  const buffer = fs.readFileSync(audioFile);
  
  console.log("Sending audio to Sarvam STT for translation...");
  const text = await sarvamProvider.speechToText(buffer, "translate");
  console.log(`✓ Translation result: "${text}"`);

  console.log("Running query understanding on the transcribed text...");
  const result = await understandQuery(text);
  console.log("Structured Query Result:\n", JSON.stringify(result, null, 2));
}

main().catch(console.error);
