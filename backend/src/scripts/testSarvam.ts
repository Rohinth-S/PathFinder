import fs from "fs";
import "../config/env.js";
import { sarvamProvider } from "../ai/sarvam.provider.js";

async function main() {
  const translation = await sarvamProvider.translate("Hello, how are you?", "te-IN", "en-IN");
  console.log("Translation:", translation);

  const audio = await sarvamProvider.textToSpeech(translation, "hi-IN");
  
  fs.writeFileSync("output.wav", Buffer.from(audio, "base64"));
  console.log("✓ Saved audio to backend/output.wav");
}

main().catch(console.error);
