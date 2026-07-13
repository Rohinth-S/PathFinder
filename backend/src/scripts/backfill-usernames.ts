import "../config/env.js";
import neo4j from "neo4j-driver";
const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

async function backfillUsernames() {
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (u:User)
            RETURN u.email AS email, u.username AS username, u.clerkId AS clerkId
        `);
        result.records.forEach(r => {
            console.log(`User: ${r.get('email')} - Username: ${r.get('username')} - Clerk: ${r.get('clerkId')}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await session.close();
        await driver.close();
    }
}

backfillUsernames();
