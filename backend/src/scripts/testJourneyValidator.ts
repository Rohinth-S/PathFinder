import "../config/env.js";
import { validateJourneyConversation } from "../processors/journey/journeyValidator.processor.js";
import { retrieveUserGraph } from "../services/userGraphRetrieval.service.js";
import { neo4jDriver } from "../config/neo4j.config.js";
import type { OnboardingMessage } from "../processors/journey/journeyValidator.schema.js";

async function runTestCase(
  name: string,
  conversation: OnboardingMessage[],
  userIdForGraph: string | null
) {
  console.log(`\n======================================================`);
  console.log(`Running Test Case: ${name}`);
  console.log(`======================================================`);

  try {
    let existingGraph = null;
    if (userIdForGraph) {
      console.log(`Retrieving existing user graph for "${userIdForGraph}"...`);
      existingGraph = await retrieveUserGraph(userIdForGraph);
      console.log("Existing graph retrieved:", existingGraph.journey ? "YES" : "NO");
    } else {
      console.log("No existing graph (new user context).");
    }

    console.log("Calling Journey Validator via Gemini...");
    const start = Date.now();
    const result = await validateJourneyConversation(conversation, existingGraph);
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`✓ Completed in ${duration}s.`);
    console.log("Validation Result:");
    console.log(`- conversationComplete: ${result.conversationComplete}`);
    console.log(`- completionReason: "${result.completionReason}"`);
    console.log(`- confidence: ${result.confidence}`);
    console.log(`- findings count: ${result.findings.length}`);
    console.log(`- questions count: ${result.questions.length}`);

    if (result.findings.length > 0) {
      console.log("\nFindings:");
      result.findings.forEach((f) => {
        console.log(`  * [${f.type.toUpperCase()}] Severity: ${f.severity}, Field: ${f.field} -> Reason: ${f.reason}`);
      });
    }

    if (result.questions.length > 0) {
      console.log("\nFollow-up Questions:");
      result.questions.forEach((q) => {
        console.log(`  * Question: "${q.question}"`);
        console.log(`    Expected fields: ${JSON.stringify(q.expectedFields)}`);
      });
    }
  } catch (error) {
    console.error("✗ Test case failed with error:", error);
  }
}

async function main() {
  try {
    // Connect Neo4j
    await neo4jDriver.verifyConnectivity();

    // Test Case 1: New user with extremely brief/ambiguous input
    const conversationNewUser: OnboardingMessage[] = [
      {
        role: "user",
        content: "Hi, I co-founded a SaaS startup. It was in SaaS and we raised some money.",
      },
    ];
    await runTestCase("New User - Vague and Incomplete Claim", conversationNewUser, null);

    // Test Case 2: Existing user with conflicting statement
    // Let's use star-builder-45 as existing graph.
    // In their graph, their experiences cover 2024-2026.
    // Let's make a contradictory claim about working somewhere else during the same period,
    // or dropping out of high school in 2026.
    const conversationExistingUser: OnboardingMessage[] = [
      {
        role: "user",
        content: "Actually, I want to update my timeline. I worked as a senior dev in London from 2024 to 2026 full time, which was my only job.",
      },
    ];
    await runTestCase("Existing User - Timeline Overlap Contradiction", conversationExistingUser, "star-builder-45");

    // Test Case 3: Complete and highly detailed onboarding conversation
    const conversationComplete: OnboardingMessage[] = [
      {
        role: "user",
        content: "My name is Dev. My goal is to build a SaaS startup in fintech called PayLedger.",
      },
      {
        role: "assistant",
        content: "Got it, PayLedger. Can you provide the start and end dates for building PayLedger, your exact role, and any key achievements?",
      },
      {
        role: "user",
        content: "Yes, I started PayLedger on 2024-01-01 and it is ongoing. My role is Co-founder & CTO. We achieved $50k MRR, built a node.js payments engine, and raised a pre-seed round of $500k. I built it with React and TypeScript.",
      },
    ];
    await runTestCase("New User - Complete Details", conversationComplete, null);

  } catch (error) {
    console.error("Connectivity error:", error);
  } finally {
    await neo4jDriver.close();
  }
}

main();
