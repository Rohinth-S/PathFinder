import { closeSession, getSession } from "./neo4j.service.js";

export interface VectorSearchResult {experienceId: string; score: number;}

export async function vectorSearchExperiences(embedding: number[],topK = 200): Promise<VectorSearchResult[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      CALL db.index.vector.queryNodes(
        'experience_embedding_index',
        $topK,
        $embedding
      )
      YIELD node, score

      RETURN
        node.id AS experienceId,
        score

      ORDER BY score DESC
      `,
      {
        embedding,
        topK,
      }
    );

    return result.records.map((record) => ({
        experienceId: record.get("experienceId") as string,
        score: record.get("score") as number,
    }));
  } finally {
    await closeSession(session);
  }
}