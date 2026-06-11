import "../config/env.js";

import { neo4jDriver } from "../config/neo4j.config.js";

async function testNeo4j(): Promise<void> {
  try {
    console.log("Connecting to Neo4j...");

    await neo4jDriver.verifyConnectivity();

    console.log("✓ Connectivity verified");

    const session = neo4jDriver.session();

    try {
      const result = await session.run(
        `
        RETURN
          'Neo4j connection successful' AS message,
          datetime() AS timestamp
        `
      );

      const record = result.records[0];

      if (!record) {
        throw new Error("No records returned")
     }

      console.log("\nQuery Result:");
      console.log("Message:", record.get("message"));
      console.log("Timestamp:", record.get("timestamp").toString());

      console.log("\n✓ Neo4j test completed successfully");
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error("✗ Neo4j test failed");
    console.error(error);
    process.exit(1);
  } finally {
    await neo4jDriver.close();
  }
}

void testNeo4j();