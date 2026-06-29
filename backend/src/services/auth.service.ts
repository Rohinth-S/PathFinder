import { getSession, closeSession } from "./neo4j.service.js";

export interface SyncedUser {
    clerkId: string;
    email: string;
    username: string | null;
    preferredLanguage: string | null;
    reputationScore: number;
    flagCount: number;
    isFlagged: boolean;
}

export async function syncUser(
    clerkId: string,
    email: string
): Promise<SyncedUser> {

    const session = getSession();

    try {

        const result = await session.run(
            `
        MERGE (u:User {
          clerkId: $clerkId
        })

        ON CREATE SET
          u.createdAt = datetime(),
          u.username = null,
          u.preferredLanguage = null,
          u.reputationScore = 0,
          u.flagCount = 0,
          u.isFlagged = false

        SET
          u.updatedAt = datetime(),
          u.email = $email

        RETURN
          u.clerkId AS clerkId,
          u.email AS email,
          u.username AS username,
          u.preferredLanguage AS preferredLanguage,
          u.reputationScore AS reputationScore,
          u.flagCount AS flagCount,
          u.isFlagged AS isFlagged
        `,
            {
                clerkId,
                email,
            }
        );

        const record = result.records[0];

        if (!record) {
            throw new Error("Failed to sync user");
        }

        return {

            clerkId: record.get("clerkId"),
            email: record.get("email"),
            username: record.get("username"),
            preferredLanguage: record.get("preferredLanguage"),
            reputationScore: record.get("reputationScore"),
            flagCount: record.get("flagCount"),
            isFlagged: record.get("isFlagged")
        };

    } finally {

        await closeSession(session);

    }
}