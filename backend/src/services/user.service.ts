import { closeSession, getSession } from "./neo4j.service.js";

export interface UpdateProfileInput {
  clerkId: string;
  username?: string;
  preferredLanguage?: string;
}

export interface UserProfile {
  clerkId: string;
  email: string;
  username: string | null;
  preferredLanguage: string | null;
  reputationScore: number;
  flagCount: number;
  isFlagged: boolean;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UserProfile> {

  const session = getSession();

  try {

    const result = await session.run(
      `
      MATCH (u:User { clerkId: $clerkId })

      SET
        u.updatedAt = datetime(),
        u.username = COALESCE($username, u.username),
        u.preferredLanguage = COALESCE($preferredLanguage, u.preferredLanguage)

      RETURN
        u.clerkId AS clerkId,
        u.email AS email,
        u.username AS username,
        u.preferredLanguage AS preferredLanguage,
        u.reputationScore AS reputationScore,
        u.flagCount AS flagCount,
        u.isFlagged AS isFlagged
      `,
      input
    );

    const record = result.records[0];

    if (!record) {
      throw new Error("User not found");
    }

    return {
      clerkId: record.get("clerkId"),
      email: record.get("email"),
      username: record.get("username"),
      preferredLanguage: record.get("preferredLanguage"),
      reputationScore: record.get("reputationScore"),
      flagCount: record.get("flagCount"),
      isFlagged: record.get("isFlagged"),
    };

  } finally {

    await closeSession(session);

  }
}

export async function getUsernameByUserId(
  clerkId: string
): Promise<string> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})
      RETURN u.username AS username
      `,
      { clerkId }
    );
    if (result.records.length === 0) {
      throw new Error("User not found.");
    }
    const username = result.records[0]?.get( "username") as string;
    if (!username) { throw new Error("Username not found.");}
    return username;
  } finally {
    await closeSession(session);
  }
}