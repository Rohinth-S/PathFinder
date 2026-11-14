import { closeSession, getSession } from "./neo4j.service.js";

const MAX_REPUTATION = 100;

const GOAL_POINTS = 2;
const EXPERIENCE_POINTS = 3;
const VERIFIED_EXPERIENCE_BONUS = 5;

async function addReputation(
  clerkId: string,
  points: number
): Promise<void> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})
      SET u.reputationScore =
        CASE
          WHEN u.reputationScore + $points > $maxScore
          THEN $maxScore
          ELSE u.reputationScore + $points
        END
      RETURN u.reputationScore AS reputationScore
      `,
      {
        clerkId,
        points,
        maxScore: MAX_REPUTATION,
      }
    );
    if (result.records.length === 0) {
      throw new Error("User not found.");
    }
  } finally {
    await closeSession(session);
  }
}

export async function addGoalReputation(
  clerkId: string,
  goalCount: number
): Promise<void> {
  const points = goalCount * GOAL_POINTS;

  if (points <= 0) {
    return;
  }
  await addReputation(clerkId, points);
}

export async function addExperienceReputation(
  clerkId: string,
  experienceCount: number,
  verifiedCount: number
): Promise<void> {
  const points =
    experienceCount * EXPERIENCE_POINTS +
    verifiedCount * VERIFIED_EXPERIENCE_BONUS;
  if (points <= 0) {
    return;
  }
  await addReputation(clerkId, points);
}