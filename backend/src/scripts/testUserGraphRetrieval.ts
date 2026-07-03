import "../config/env.js";
import { retrieveUserGraph } from "../services/userGraphRetrieval.service.js";
import { neo4jDriver } from "../config/neo4j.config.js";

async function main() {
  try {
    console.log("Verifying Neo4j connectivity...");
    await neo4jDriver.verifyConnectivity();
    console.log("✓ Neo4j connected\n");

    // Test 1a: Retrieve existing user by username
    const username = "star-builder-45";
    console.log(`Test 1a: Retrieving existing user graph for username: "${username}"...`);
    const graphResult = await retrieveUserGraph(username);
    console.log("Result status:", graphResult.journey ? "FOUND" : "NOT FOUND");
    if (graphResult.journey) {
      console.log("Metadata lastUpdated:", graphResult.metadata.lastUpdated);
      console.log("User details:", JSON.stringify(graphResult.journey.user, null, 2));
      console.log(`Goals count: ${graphResult.journey.goals.length}`);
      console.log(`Experiences count: ${graphResult.journey.experiences.length}`);
      console.log(`Transitions count: ${graphResult.journey.transitions.length}`);
    }

    // Test 1b: Retrieve existing user by Clerk ID
    const clerkId = "user_3Fo3UvyCWdcLsERknycbmHnwQmo";
    console.log(`\nTest 1b: Retrieving existing user graph for Clerk ID: "${clerkId}"...`);
    const graphResultClerk = await retrieveUserGraph(clerkId);
    console.log("Result status:", graphResultClerk.journey ? "FOUND" : "NOT FOUND");
    if (graphResultClerk.journey) {
      console.log("Metadata lastUpdated:", graphResultClerk.metadata.lastUpdated);
      console.log("User details:", JSON.stringify(graphResultClerk.journey.user, null, 2));
      console.log(`Goals count: ${graphResultClerk.journey.goals.length}`);
      console.log(`Experiences count: ${graphResultClerk.journey.experiences.length}`);
      console.log(`Transitions count: ${graphResultClerk.journey.transitions.length}`);
    }

    // Test 2: Retrieve nonexistent user
    const fakeUsername = "completely-nonexistent-user-xyz";
    console.log(`\nTest 2: Retrieving nonexistent user graph for "${fakeUsername}"...`);
    const fakeResult = await retrieveUserGraph(fakeUsername);
    console.log("Result status:", fakeResult.journey ? "FOUND" : "NOT FOUND");
    console.log("Result object:", JSON.stringify(fakeResult, null, 2));
    if (fakeResult.journey === null && Object.keys(fakeResult.metadata).length === 0) {
      console.log("✓ Properly handled nonexistent user graph.");
    } else {
      console.error("✗ Failed to return empty structure for nonexistent user!");
    }

  } catch (error) {
    console.error("✗ Error running user graph retrieval test:", error);
  } finally {
    await neo4jDriver.close();
  }
}

main();
