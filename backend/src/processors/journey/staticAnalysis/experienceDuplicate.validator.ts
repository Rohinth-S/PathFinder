import { generateEmbedding } from "../../../services/embeddings.service.js";
import { closeSession, getSession } from "../../../services/neo4j.service.js";

const DUPLICATE_THRESHOLD = 0.92;

interface ValidateExperienceInput {
  title: string;
  organization?: string | undefined;  
  description?: string | undefined;   
  achievements?: string[] | undefined; 
  outcome?: string | undefined;        
}

export async function validateExperienceDuplicate(
  userId: string,
  experience: ValidateExperienceInput
): Promise<boolean> {
  const session = getSession();
  try {
    const textToEmbed = [
      experience.title,
      experience.organization || "",
      experience.description || "",
      (experience.achievements || []).join("\n"),
      experience.outcome || ""
    ]
      .filter((text) => text.trim().length > 0)
      .join("\n\n");

    const embedding = await generateEmbedding(textToEmbed);
    const result = await session.run(
      `
      CALL db.index.vector.queryNodes(
        'experience_embedding_index',
        5,
        $embedding
      )
      YIELD node, score
      
      MATCH (u:User {clerkId: $userId})-[:HAS_EXPERIENCE]->(node)
      
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