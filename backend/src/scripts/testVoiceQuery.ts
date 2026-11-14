import fs from "fs";
import "../config/env.js";
import { sarvamProvider } from "../ai/sarvam.provider.js";
import { understandQuery } from "../processors/query/understandQuery.processor.js";
import path from "path";

async function main() {
  const audioFile = process.argv[2] || "output.wav";
  const audioPath = path.resolve(audioFile);
  if (!fs.existsSync(audioPath)) {
    console.error(
      `Audio file "${audioFile}" not found.`
    );
    process.exit(1);
  }

  console.log(`Reading audio file: ${audioPath}`);
  const audioBuffer = fs.readFileSync(audioPath);
  
  console.log("Sending audio to Sarvam STT for translation...");
  const text = await sarvamProvider.speechToText(audioBuffer, path.basename(audioPath),"audio/wav","translate");
  console.log(`✓ Translation result: "${text}"`);

  console.log("Running query understanding on the transcribed text...");
  const result = await understandQuery(text);
  console.log("Structured Query Result:\n", JSON.stringify(result, null, 2));
}

main().catch(console.error);
