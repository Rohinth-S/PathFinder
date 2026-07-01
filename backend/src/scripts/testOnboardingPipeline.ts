import "../config/env.js";
import { validateJourneyConversation } from "../processors/journey/journeyValidator.processor.js";
import { extractJourney } from "../processors/journey/extractJourney.processor.js";
import { validateJourneySchema } from "../processors/journey/schemaValidation.processor.js";
import { normalizeJourney } from "../processors/journey/normalizer/engine.js";
import { analyzeStaticRules } from "../processors/journey/staticAnalysis/engine.js";
import { neo4jDriver } from "../config/neo4j.config.js";
import type { OnboardingMessage } from "../processors/journey/journeyValidator.schema.js";

async function main() {
  try {
    console.log("Starting End-to-End Onboarding Pipeline Test...");
    await neo4jDriver.verifyConnectivity();

    // 1. Initial User Statement (Vague / Incomplete)
    const conversation: OnboardingMessage[] = [
      {
        role: "user",
        content: "Hi, I'm Mitul. I got into IIT Madras in 2020. I did a Google internship in 2022. I dropped out in 2023 to build a startup called HackHazards.",
      },
    ];

    console.log("\n--- Turn 1: Validating Initial Statement ---");
    console.log("User says:", conversation[0]?.content);

    let validationResult = await validateJourneyConversation(conversation, null);

    console.log(`Validator completion status: ${validationResult.conversationComplete}`);
    console.log(`Completion reason: "${validationResult.completionReason}"`);
    console.log(`Journey confidence: ${validationResult.confidence}`);
    console.log(`Findings detected: ${validationResult.findings.length}`);
    console.log(`Questions generated: ${validationResult.questions.length}`);

    if (validationResult.questions.length > 0) {
      const followUp = validationResult.questions[0]?.question || "";
      console.log(`Assistant asks: "${followUp}"`);

      // 2. Append Assistant Question and User Response to conversation history
      conversation.push({
        role: "assistant",
        content: followUp,
      });

      const userReply = "I was a Software Engineering Intern at Google from 2022-05-01 to 2022-08-01. HackHazards is a security SaaS. I started it on 2023-06-01 and it is ongoing. I decided to drop out of IIT Madras in June 2023 because I wanted to dedicate 100% of my time to building HackHazards.";
      console.log(`User replies: "${userReply}"`);

      conversation.push({
        role: "user",
        content: userReply,
      });

      // 3. Turn 2: Run Validator Again
      console.log("\n--- Turn 2: Validating After Follow-up ---");
      validationResult = await validateJourneyConversation(conversation, null);

      console.log(`Validator completion status: ${validationResult.conversationComplete}`);
      console.log(`Completion reason: "${validationResult.completionReason}"`);
      console.log(`Journey confidence: ${validationResult.confidence}`);
      console.log(`Findings detected: ${validationResult.findings.length}`);
      console.log(`Questions generated: ${validationResult.questions.length}`);
    }

    // 4. Force/proceed to extraction if complete (or mock complete for extraction test)
    console.log("\n--- Step 4: Extracting Journey JSON from Final Conversation ---");
    const extractedGraph = await extractJourney(conversation, {
      username: "mitul",
      email: "mitul@example.com",
    });

    console.log("✓ Journey JSON Extracted successfully.");

    // 5. Run Schema Validation
    console.log("\n--- Step 5: Validating Journey Schema ---");
    const schemaValidation = validateJourneySchema(extractedGraph);
    if (!schemaValidation.success) {
      console.error("✗ Schema validation failed:", JSON.stringify(schemaValidation.errors, null, 2));
      return;
    }
    console.log("✓ Journey schema is structurally valid.");

    // 6. Run Journey Normalizer
    console.log("\n--- Step 6: Normalizing Journey Graph ---");
    const normalizationResult = normalizeJourney(schemaValidation.data);
    console.log("✓ Journey normalized successfully.");

    // 7. Run Static Analysis on the Normalized Journey
    console.log("\n--- Step 7: Performing Static Quality Analysis ---");
    const analysis = analyzeStaticRules(normalizationResult.journey);
    console.log(`✓ Static Analysis complete. Found ${analysis.issues.length} potential issues.`);
    if (analysis.issues.length > 0) {
      analysis.issues.forEach((issue) => {
        console.log(`  * [${issue.severity.toUpperCase()}] Type: ${issue.type} -> ${issue.message}`);
      });
    }

    console.log("\n--- FINAL EXTRACTED & NORMALIZED JOURNEY GRAPH ---");
    console.log(JSON.stringify(normalizationResult.journey, null, 2));

    console.log("\n✓ End-to-End Onboarding Pipeline Test completed successfully.");

  } catch (error) {
    console.error("✗ Error running onboarding pipeline integration test:", error);
  } finally {
    await neo4jDriver.close();
  }
}

main();
