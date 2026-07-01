import "../config/env.js";
import { getSession, closeSession } from "../services/neo4j.service.js";
import { neo4jDriver } from "../config/neo4j.config.js";

async function main() {
  const session = getSession();
  try {
    console.log("Listing users in database...");
    const result = await session.run("MATCH (u:User) RETURN u.username AS username, u.clerkId AS clerkId");
    if (result.records.length === 0) {
      console.log("No users found in database.");
    } else {
      console.log(`Found ${result.records.length} users:`);
      for (const record of result.records) {
        console.log(`- Username: "${record.get("username")}", Clerk ID: "${record.get("clerkId")}"`);
      }
    }
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    await closeSession(session);
    await neo4jDriver.close();
  }
}

main();
