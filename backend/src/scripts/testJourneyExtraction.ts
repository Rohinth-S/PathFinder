import "../config/env.js";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractJourney } from "../processors/journey/extractJourney.processor.js";
import { journeyJsonSchema } from "../processors/journey/journeySchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest(testName: string, text: string) {
  console.log(`\n=========================================`);
  console.log(`Running Test: ${testName}`);
  console.log(`=========================================`);
  console.log(`Input length: ${text.length} characters`);

  try {
    const start = Date.now();
    const result = await extractJourney([{ role: "user", content: text }]);
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`✓ Gemini Extraction completed in ${duration}s.`);
    console.log("Validating schema using zod...");

    const validation = journeyJsonSchema.safeParse(result);
    if (validation.success) {
      console.log("✓ Zod Validation: SUCCESS!");
      console.log("\nExtracted Graph Output:");
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("✗ Zod Validation: FAILED!");
      console.error(JSON.stringify(validation.error.format(), null, 2));
      console.log("\nRaw Result was:");
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error: any) {
    console.error("✗ Extraction error encountered:");
    console.error(error.message || error);
  }
}

async function main() {
  // Test 1: Rich markdown timeline
  const rawJourneysDir = resolve(__dirname, "../db/raw_journeys");
  const testFile = resolve(rawJourneysDir, "ritesh-agarwal.md");

  let richText = "";
  try {
    richText = await readFile(testFile, "utf-8");
  } catch (error) {
    console.warn("Could not load ritesh-agarwal.md, using default fallback rich text.");
    richText = "I co-founded AdventNet in 1996 to build software, and scaled it globally until 2008.";
  }

  await runTest("Rich Markdown Timeline (Ritesh Agarwal)", richText);

  // Test 2: Short, casual natural language input
  const shortText = `
    Hi, I am Alex. I got into IIT Madras in 2018 for Software Engineering. In 2020, I did an internship at Google, building backend APIs with Node.js and TypeScript.
    But in 2021 I decided to drop out to build a SaaS startup called DevDoc.
    We struggled to get PMF initially, but we finally achieved $10k MRR in 2022! My github link is github.com/alex/devdoc.
  `;

  await runTest("Short Conversational Input (Alex)", shortText);
}

main();
