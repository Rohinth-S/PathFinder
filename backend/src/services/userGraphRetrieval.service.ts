import { closeSession, getSession } from "./neo4j.service.js";
import type { JourneyJson } from "../processors/journey/types.js";

export interface ExistingUserGraph {
  journey: JourneyJson | null;
  metadata: {
    lastUpdated?: string;
  };
}

function neo4jValueToString(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val.toString === "function") {
    return val.toString();
  }
  return null;
}

/**
 * Retrieves the complete career/founder graph for a specific user from Neo4j.
 *
 * @param userId - The Clerk ID or username of the target user.
 * @returns An ExistingUserGraph object containing the journey (in JourneyJson format) and metadata.
 */
export async function retrieveUserGraph(userId: string): Promise<ExistingUserGraph> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE u.clerkId = $userId OR u.username = $userId

      OPTIONAL MATCH (u)-[:HAS_GOAL]->(g:Goal)
      WITH u, collect(DISTINCT g) AS goals

      OPTIONAL MATCH (u)-[r:HAS_EXPERIENCE]->(e:Experience)
      WITH u, goals, r, e ORDER BY r.order ASC

      OPTIONAL MATCH (e)-[:BUILT_SKILL]->(s:Skill)
      WITH u, goals, e, collect(DISTINCT s) AS skills

      OPTIONAL MATCH (e)-[:HAS_PROOF]->(p:Proof)
      WITH u, goals, e, skills, collect(DISTINCT p) AS proofs

      OPTIONAL MATCH (e)-[:CONTRIBUTED_TO]->(eg:Goal)
      WITH u, goals, e, skills, proofs, collect(DISTINCT eg.id) AS goalIds

      WITH u, goals, collect({
        experience: e,
        skills: skills,
        proofs: proofs,
        goalIds: goalIds
      }) AS expData

      OPTIONAL MATCH (e1:Experience)<-[:HAS_EXPERIENCE]-(u)-[:HAS_EXPERIENCE]->(e2:Experience)
      OPTIONAL MATCH (e1)-[t:TRANSITION]->(e2)
      WITH u, goals, expData, collect(DISTINCT {
        fromExperienceId: e1.id,
        toExperienceId: e2.id,
        decisionLabel: t.decisionLabel
      }) AS transitions

      RETURN u, goals, expData, transitions
      `,
      { userId }
    );

    if (result.records.length === 0) {
      return {
        journey: null,
        metadata: {},
      };
    }

    const record = result.records[0];
    if (!record) {
      return {
        journey: null,
        metadata: {},
      };
    }
    const uNode = record.get("u");
    if (!uNode) {
      return {
        journey: null,
        metadata: {},
      };
    }

    const userProps = uNode.properties;
    const user = {
      username: userProps.username || "",
      clerkId: userProps.clerkId || null,
      preferredLanguage: userProps.preferredLanguage || "en",
      reputationScore: userProps.reputationScore !== undefined ? Number(userProps.reputationScore) : 0,
      flagCount: userProps.flagCount !== undefined ? Number(userProps.flagCount) : 0,
      isFlagged: !!userProps.isFlagged,
      email: userProps.email || null,
    };

    const goals = (record.get("goals") || [])
      .filter((g: any) => g !== null && g !== undefined)
      .map((gNode: any) => {
        const p = gNode.properties;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          topics: p.topics || [],
          subtopics: p.subtopics || [],
          startDate: neo4jValueToString(p.startDate) || "",
          endDate: neo4jValueToString(p.endDate) || null,
        };
      });

    const experiences = (record.get("expData") || [])
      .filter((item: any) => item.experience !== null && item.experience !== undefined)
      .map((item: any) => {
        const e = item.experience.properties;
        const skills = (item.skills || [])
          .filter((s: any) => s !== null && s !== undefined)
          .map((sNode: any) => ({
            name: sNode.properties.name,
            type: sNode.properties.type,
          }));

        const proofs = (item.proofs || [])
          .filter((p: any) => p !== null && p !== undefined)
          .map((pNode: any) => {
            const pp = pNode.properties;
            return {
              id: pp.id,
              sourceType: pp.sourceType,
              url: pp.url,
              status: pp.status,
              verifiedAt: neo4jValueToString(pp.verifiedAt) || null,
              reason: pp.reason || null,
            };
          });

        return {
          id: e.id,
          title: e.title,
          startDate: neo4jValueToString(e.startDate) || "",
          endDate: neo4jValueToString(e.endDate) || null,
          context: e.context || "",
          challengeFaced: e.challengeFaced || null,
          outcome: e.outcome || null,
          organization: e.organization || null,
          applicationStatus: e.applicationStatus || null,
          achievements: e.achievements || [],
          isVerified: !!e.isVerified,
          goalIds: item.goalIds || [],
          skills,
          proofs,
          timelineSummary: e.timelineSummary || "",
        };
      });

    const transitions = (record.get("transitions") || [])
      .filter((t: any) => t && t.fromExperienceId !== null && t.fromExperienceId !== undefined)
      .map((t: any) => ({
        fromExperienceId: t.fromExperienceId,
        toExperienceId: t.toExperienceId,
        decisionLabel: t.decisionLabel || "Transitioned",
      }));

    const lastUpdated = userProps.updatedAt
      ? neo4jValueToString(userProps.updatedAt)
      : (userProps.createdAt ? neo4jValueToString(userProps.createdAt) : null);

    const metadata: { lastUpdated?: string } = {};
    if (lastUpdated) {
      metadata.lastUpdated = lastUpdated;
    }

    return {
      journey: {
        user,
        goals,
        experiences,
        transitions,
      },
      metadata,
    };
  } finally {
    await closeSession(session);
  }
}
