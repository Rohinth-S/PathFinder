import { getSession, closeSession } from "./neo4j.service.js";

export interface ExistingGoal {
  id: string;
  title: string;
}

export async function getUserGoals(
  userId: string
): Promise<ExistingGoal[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {clerkId: $userId})-[:HAS_GOAL]->(g:Goal)
      RETURN
        g.id AS id,
        g.title AS title
      ORDER BY g.startDate ASC
      `,
      {
        userId,
      }
    );
    return result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
    }));
  } finally {
    await closeSession(session);
  }
}