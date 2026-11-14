import { generateEmbedding } from "../../../services/embeddings.service.js";
import { closeSession, getSession } from "../../../services/neo4j.service.js";
const DUPLICATE_THRESHOLD = 0.92;

export async function validateGoalDuplicate(
  userId: string,
  title: string,
  description: string
): Promise<boolean> {
  const session = getSession();
  try {
    const embedding = await generateEmbedding(`${title}\n\n${description}`);
    const result = await session.run(
      `
      CALL db.index.vector.queryNodes(
        'goal_embedding_index',
        5,
        $embedding
      )
      YIELD node, score
      
      MATCH (u:User {clerkId: $userId})-[:HAS_GOAL]->(node)
      
      RETURN score
      ORDER BY score DESC
      LIMIT 1
      `,
      {
        userId,
        embedding,
      }
    );
    if (result.records.length === 0) {
      return false;
    }
    const highestScore = result.records[0]!.get("score") as number;
    return highestScore >= DUPLICATE_THRESHOLD;
  } finally {
    await closeSession(session);
  }
}