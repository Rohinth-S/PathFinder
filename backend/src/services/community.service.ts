import { getSession, closeSession } from "./neo4j.service.js";

const TOPIC_SCORE = 10;
const SUBTOPIC_SCORE = 20;
const VERIFIED_SCORE = 5;
const REPUTATION_SCORE = 3;
const HIGH_REPUTATION_THRESHOLD = 100;

export interface SearchCommunityUsersInput {
    topic: string | undefined;
    subtopic: string | undefined;
    page: number;
    limit: number;
}

export async function getCommunityTopics(): Promise<string[]> {
    const session = getSession();

    try {
        const result = await session.run(
            `
      MATCH (g:Goal)
      UNWIND g.topics AS topic
      RETURN DISTINCT topic
      ORDER BY topic
      `
        );

        return result.records.map((record) => record.get("topic"));
    } finally {
        await closeSession(session);
    }
}

export async function getCommunitySubtopics(
    topic: string
): Promise<string[]> {
    const session = getSession();

    try {
        const result = await session.run(
            `
      MATCH (g:Goal)
      WHERE $topic IN g.topics

      UNWIND g.subtopics AS subtopic

      RETURN DISTINCT subtopic
      ORDER BY subtopic
      `,
            {
                topic,
            }
        );

        return result.records.map((record) => record.get("subtopic"));
    } finally {
        await closeSession(session);
    }
}

export async function searchCommunityUsers(
  input: SearchCommunityUsersInput
) {
  const session = getSession();

  try {
    const skip = (input.page - 1) * input.limit;

    const result = await session.run(
      `
      MATCH (u:User)

      // Fetch all goals for the user
      CALL {
        WITH u
        OPTIONAL MATCH (u)-[:HAS_GOAL]->(g:Goal)
        RETURN collect(g) AS goals
      }

      // Count experiences and check verification
      CALL {
        WITH u
        OPTIONAL MATCH (u)-[:HAS_EXPERIENCE]->(e:Experience)

        RETURN
          count(e) AS experienceCount,
          any(exp IN collect(e) WHERE exp.isVerified) AS hasVerifiedExperience
      }

      // Latest experience
      CALL {
        WITH u
        OPTIONAL MATCH (u)-[r:HAS_EXPERIENCE]->(latest:Experience)

        WITH latest, r
        ORDER BY r.order DESC
        LIMIT 1

        RETURN latest
      }

      WITH
        u,
        goals,
        experienceCount,
        hasVerifiedExperience,
        latest

      WHERE
        (
          $topic IS NULL OR
          ANY(goal IN goals WHERE $topic IN goal.topics)
        )
      AND
        (
          $subtopic IS NULL OR
          ANY(goal IN goals WHERE $subtopic IN goal.subtopics)
        )

      WITH
        u,
        goals,
        experienceCount,
        latest,

        (
          CASE
            WHEN $topic IS NOT NULL
              AND ANY(goal IN goals WHERE $topic IN goal.topics)
            THEN $topicScore
            ELSE 0
          END +

          CASE
            WHEN $subtopic IS NOT NULL
              AND ANY(goal IN goals WHERE $subtopic IN goal.subtopics)
            THEN $subtopicScore
            ELSE 0
          END +

          CASE
            WHEN hasVerifiedExperience
            THEN $verifiedScore
            ELSE 0
          END +

          CASE
            WHEN u.reputationScore >= $highReputationThreshold
            THEN $reputationScore
            ELSE 0
          END
        ) AS score

      RETURN
        u.username AS username,
        u.reputationScore AS reputationScore,

        [goal IN goals | goal.topics] AS topics,
        [goal IN goals | goal.subtopics] AS subtopics,

        experienceCount,

        latest {
          .title,
          .timelineSummary,
          .organization,
          .isVerified
        } AS latestExperience

      ORDER BY
        score DESC,
        u.reputationScore DESC,
        u.username ASC

      SKIP toInteger($skip)
      LIMIT toInteger($limit)
      `,
      {
        topic: input.topic ?? null,
        subtopic: input.subtopic ?? null,

        skip,
        limit: input.limit,

        topicScore: TOPIC_SCORE,
        subtopicScore: SUBTOPIC_SCORE,
        verifiedScore: VERIFIED_SCORE,
        reputationScore: REPUTATION_SCORE,
        highReputationThreshold: HIGH_REPUTATION_THRESHOLD,
      }
    );

    return result.records.map((record) => ({
      username: record.get("username"),

      reputationScore: record.get("reputationScore"),

      topics: [...new Set(record.get("topics").flat())],

      subtopics: [...new Set(record.get("subtopics").flat())],

      experienceCount: Number(
        record.get("experienceCount")
      ),

      latestExperience: record.get("latestExperience"),
    }));
  } finally {
    await closeSession(session);
  }
}

function neo4jDateToString(date: any): string | null {
  return date ? date.toString() : null;
}

export async function getCommunityJourney(
  username: string
) {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {username: $username})

      OPTIONAL MATCH (u)-[:HAS_GOAL]->(g:Goal)

      OPTIONAL MATCH (u)-[:HAS_EXPERIENCE]->(e:Experience)

      OPTIONAL MATCH (e)-[:BUILT_SKILL]->(s:Skill)

      OPTIONAL MATCH (e)-[:CONTRIBUTED_TO]->(goal:Goal)

      OPTIONAL MATCH (e)-[t:TRANSITION]->(next:Experience)

      WITH
        u,
        collect(DISTINCT g) AS goals,
        e,
        collect(DISTINCT s) AS skills,
        collect(DISTINCT {
          id: goal.id,
          title: goal.title
        }) AS experienceGoals,
        t,
        next

      WITH
        u,
        goals,
        collect({
          experience: e,
          skills: skills,
          goals: experienceGoals,
          transition:
            CASE
              WHEN t IS NULL THEN null
              ELSE {
                toExperienceId: next.id,
                decisionLabel: t.decisionLabel
              }
            END
        }) AS experiences

      RETURN
        u,
        goals,
        experiences
      `,
      {
        username,
      }
    );

    if (result.records.length === 0) {
      throw new Error("Journey not found");
    }

    const record = result.records[0];

    if (!record) {
      throw new Error("Journey not found");
    }

    return {
      user: {
        username: record.get("u").properties.username,
        reputationScore:
          record.get("u").properties.reputationScore,
      },

      goals: record.get("goals").map((goal: any) => ({
        id: goal.properties.id,
        title: goal.properties.title,
        description: goal.properties.description,
        status: goal.properties.status,
        topics: goal.properties.topics,
        subtopics: goal.properties.subtopics,
        startDate: neo4jDateToString(goal.properties.startDate),
        endDate: neo4jDateToString(goal.properties.endDate),
      })),

      experiences: record
        .get("experiences")
        .filter((item: any) => item.experience)
        .map((item: any) => {
          const e = item.experience.properties;

          return {
            id: e.id,
            title: e.title,
            timelineSummary: e.timelineSummary,

            startDate: neo4jDateToString(e.startDate),
            endDate: neo4jDateToString(e.endDate),

            context: e.context,
            challengeFaced: e.challengeFaced,
            outcome: e.outcome,

            organization: e.organization,
            applicationStatus: e.applicationStatus,

            achievements: e.achievements,
            isVerified: e.isVerified,

            skills: item.skills.map((skill: any) => ({
              name: skill.properties.name,
              type: skill.properties.type,
            })),

            goals: item.goals,

            transition: item.transition,
          };
        }),
    };
  } finally {
    await closeSession(session);
  }
}