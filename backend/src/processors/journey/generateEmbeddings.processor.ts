import { generateEmbedding } from "../../services/embeddings.service.js";
import { closeSession, getSession } from "../../services/neo4j.service.js";

export interface ExperienceEmbeddingInput {
  id: string;
  title: string;
  context: string;
  challengeFaced?: string | null;
  outcome?: string | null;
  achievements?: string[] | null;
  skills?: string[];
}

export interface GoalEmbeddingInput {
  id: string;
  title: string;
  description: string;
}

function buildEmbeddingText(
  experience: ExperienceEmbeddingInput
): string {
  return [
    `Title: ${experience.title}`,
    `Context: ${experience.context}`,

    experience.challengeFaced
      ? `Challenge: ${experience.challengeFaced}`
      : null,

    experience.outcome
      ? `Outcome: ${experience.outcome}`
      : null,

    experience.achievements?.length
      ? `Achievements: ${experience.achievements.join(", ")}`
      : null,

    experience.skills?.length
      ? `Skills: ${experience.skills.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildGoalEmbeddingText(
  goal: GoalEmbeddingInput
): string {
  return [
    `Title: ${goal.title}`,
    `Description: ${goal.description}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function storeExperienceEmbedding(
  experienceId: string,
  embedding: number[]
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (e:Experience {id: $experienceId})
      SET e.embedding = $embedding
      `,
      {
        experienceId,
        embedding,
      }
    );
  } finally {
    await closeSession(session);
  }
}
async function storeGoalEmbedding(
  goalId: string,
  embedding: number[]
): Promise<void> {
  const session = getSession();

  try {
    await session.run(
      `
      MATCH (g:Goal {id: $goalId})
      SET g.embedding = $embedding
      `,
      {
        goalId,
        embedding,
      }
    );
  } finally {
    await closeSession(session);
  }
}

export async function generateExperienceEmbedding(
  experience: ExperienceEmbeddingInput
): Promise<void> {
  const embeddingText =buildEmbeddingText(experience);
  const embedding =await generateEmbedding(embeddingText);

await storeExperienceEmbedding(
  experience.id,
  embedding
);
}

export async function generateGoalEmbedding(
  goal: GoalEmbeddingInput
): Promise<void> {
  const embeddingText = buildGoalEmbeddingText(goal);
  const embedding = await generateEmbedding(embeddingText);
  await storeGoalEmbedding(
    goal.id,
    embedding
  );
}