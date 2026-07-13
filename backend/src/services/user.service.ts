import type { JourneyExperience, JourneyTransition } from "../processors/journey/journeySchema.js";
import type { JourneyGoal } from "../types/journey/Journey.types.js";
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
    const username = result.records[0]?.get("username") as string;
    if (!username) { throw new Error("Username not found."); }
    return username;
  } finally {
    await closeSession(session);
  }
}

export interface UserJourneyStatistics {
  goals: number;
  experiences: number;
  transitions: number;
}

export interface UserJourney {
  username: string;
  imageUrl: string | null;
  statistics: UserJourneyStatistics;
  goals: JourneyGoal[];
  experiences: Omit<JourneyExperience, "proofs">[];
  transitions: JourneyTransition[];
}

export async function getUserJourney(
  clerkId: string
): Promise<UserJourney> {
  const session = getSession();

  try {
    const userResult = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})
      RETURN u.username AS username,
      u.imageUrl AS imageUrl
      `,
      { clerkId }
    );
    if (userResult.records.length === 0) {
      throw new Error("User not found.");
    }
    const record = userResult.records[0];

    if (!record) {
      throw new Error("User not found.");
    }

    const username = record.get("username") as string;
    const imageUrl = record.get("imageUrl") as string | null;

    const goalsResult = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})-[:HAS_GOAL]->(g:Goal)
      RETURN g
      `,
      { clerkId }
    );

    const goals = goalsResult.records.map((record) => {
      const goal = record.get("g");
      return {
        id: goal.properties.id,
        title: goal.properties.title,
        description: goal.properties.description,
        status: goal.properties.status,
        topics: goal.properties.topics,
        subtopics: goal.properties.subtopics,
        startDate: goal.properties.startDate.toString(),
        endDate: goal.properties.endDate ? goal.properties.endDate.toString() : null,
      };
    }) satisfies JourneyGoal[];
    const experiencesResult = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})-[:HAS_EXPERIENCE]->(e:Experience)
      OPTIONAL MATCH (e)-[:BUILT_SKILL]->(s:Skill)
      RETURN e, collect(DISTINCT s) AS skills
      `,
      { clerkId }
    );

    const experiences = experiencesResult.records.map((record) => {
      const experience = record.get("e").properties;
      const skillNodes = record.get("skills") as any[];

      return {
        id: experience.id,
        title: experience.title,
        startDate: experience.startDate.toString(),
        endDate: experience.endDate ? experience.endDate.toString() : null,
        context: experience.context,
        challengeFaced: experience.challengeFaced ?? null,
        outcome: experience.outcome ?? null,
        organization: experience.organization ?? null,
        applicationStatus: experience.applicationStatus ?? null,
        achievements: experience.achievements ?? null,
        isVerified: experience.isVerified ?? false,
        timelineSummary: experience.timelineSummary,
        goalIds: [] as string[], // Populated in the map below
        skills: skillNodes.filter(Boolean).map((skill) => ({
          name: skill.properties.name,
          type: skill.properties.type,
        })),
      };
    });
    const goalRelationshipResult = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})-[:HAS_EXPERIENCE]->(e:Experience)-[:CONTRIBUTED_TO]->(g:Goal)
      RETURN e.id AS experienceId, collect(g.id) AS goalIds
      `,
      { clerkId }
    );

    const goalMap = new Map<string, string[]>();
    for (const rec of goalRelationshipResult.records) {
      goalMap.set(rec.get("experienceId"), rec.get("goalIds"));
    }

    experiences.forEach((exp) => {
      exp.goalIds = goalMap.get(exp.id) ?? [];
    });

    const transitionsResult = await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})-[:HAS_EXPERIENCE]->(from:Experience)-[t:TRANSITION]->(to:Experience)
      RETURN from.id AS fromExperienceId, to.id AS toExperienceId, t.decisionLabel AS decisionLabel
      `,
      { clerkId }
    );

    const transitions = transitionsResult.records.map((record) => ({
      fromExperienceId: record.get("fromExperienceId") as string,
      toExperienceId: record.get("toExperienceId") as string,
      decisionLabel: record.get("decisionLabel") as string,
    })) satisfies JourneyTransition[];

    return {
      username,
      imageUrl,
      statistics: {
        goals: goals.length,
        experiences: experiences.length,
        transitions: transitions.length,
      },
      goals,
      experiences,
      transitions,
    };
  } finally {
    await closeSession(session);
  }
}

export async function updateUserSummary(
  clerkId: string,
  summary: string,
  expertiseAreas: string[]
): Promise<void> {
  const session = getSession();

  try {
    await session.run(
      `
      MATCH (u:User {clerkId: $clerkId})

      SET
        u.summary = $summary,
        u.expertiseAreas = $expertiseAreas,
        u.updatedAt = datetime()
      `,
      {
        clerkId,
        summary,
        expertiseAreas,
      }
    );
  } finally {
    await closeSession(session);
  }
}