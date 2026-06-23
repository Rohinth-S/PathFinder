import {closeSession,getSession} from "./neo4j.service.js";

export async function retrieveUsersByGoals(topics: string[],subtopics: string[]): Promise<string[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:HAS_GOAL]->(g:Goal)

      WHERE
      (
        size($topics) = 0 OR
        any(
          topic IN g.topics
          WHERE topic IN $topics
        )
      )

      AND

      (
        size($subtopics) = 0 OR
        any(
          subtopic IN g.subtopics
          WHERE subtopic IN $subtopics
        )
      )

      RETURN DISTINCT u.username AS username
      `,
      {
        topics,
        subtopics,
      }
    );

    return result.records.map(
      (record) =>record.get("username") as string
    );
  } finally {
    await closeSession(session);
  }
}