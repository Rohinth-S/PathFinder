import { getSession, closeSession } from "./neo4j.service.js";
import type { JourneyJson } from "../processors/journey/types.js";

/**
 * Inserts or completely overwrites a user's graph (Experiences, Goals, Skills)
 * into Neo4j.
 * 
 * @param clerkId - The authenticated user's clerk ID.
 * @param journey - The extracted and normalized JourneyJson object.
 */
export async function insertUserGraph(clerkId: string, journey: JourneyJson): Promise<void> {
  const session = getSession();

  try {
    // We execute this in a single transaction to ensure the graph is saved atomically.
    await session.executeWrite(async (tx) => {
      // 1. Delete the user's existing Journey subtree
      // Match all experiences connected to this user and cascade delete their local skills/proofs
      // and their relationships. We also delete goals directly connected.
      await tx.run(`
        MATCH (u:User {clerkId: $clerkId})
        
        // Find existing experiences and goals
        OPTIONAL MATCH (u)-[:HAS_EXPERIENCE]->(e:Experience)
        OPTIONAL MATCH (u)-[:HAS_GOAL]->(g:Goal)
        
        // Find skills that are ONLY connected to these experiences (to avoid deleting shared skills, 
        // but here we model skills as unique to the experience, or we just detach them).
        // Best approach: DETACH DELETE e and g. If Skills are shared, we just detach the BUILT_SKILL relation.
        
        // First detach/delete Experiences
        DETACH DELETE e
        
        // Detach/delete Goals
        DETACH DELETE g
      `, { clerkId });

      // 2. Insert Goals
      if (journey.goals && journey.goals.length > 0) {
        await tx.run(`
          MATCH (u:User {clerkId: $clerkId})
          UNWIND $goals AS g
          CREATE (goal:Goal {
            id: g.id,
            title: g.title,
            description: g.description,
            status: g.status,
            topics: g.topics,
            subtopics: g.subtopics,
            startDate: g.startDate,
            endDate: g.endDate
          })
          CREATE (u)-[:HAS_GOAL]->(goal)
        `, { clerkId, goals: journey.goals });
      }

      // 3. Insert Experiences and Skills
      if (journey.experiences && journey.experiences.length > 0) {
        // Prepare experiences data with order index
        const exps = journey.experiences.map((e, index) => ({
          ...e,
          order: index,
        }));

        await tx.run(`
          MATCH (u:User {clerkId: $clerkId})
          UNWIND $experiences AS e
          
          CREATE (exp:Experience {
            id: e.id,
            title: e.title,
            startDate: e.startDate,
            endDate: e.endDate,
            context: e.context,
            challengeFaced: e.challengeFaced,
            outcome: e.outcome,
            organization: e.organization,
            applicationStatus: e.applicationStatus,
            achievements: e.achievements,
            isVerified: e.isVerified,
            timelineSummary: e.timelineSummary
          })
          
          CREATE (u)-[:HAS_EXPERIENCE {order: e.order}]->(exp)
        `, { clerkId, experiences: exps });

        // Insert skills for each experience
        // We'll iterate the experiences since Neo4j UNWIND with nested arrays can be complex,
        // or we can flatten the skills into { experienceId, name, type }
        const flattenedSkills = [];
        for (const exp of journey.experiences) {
          if (exp.skills) {
            for (const skill of exp.skills) {
              flattenedSkills.push({
                experienceId: exp.id,
                name: skill.name,
                type: skill.type,
              });
            }
          }
        }

        if (flattenedSkills.length > 0) {
          await tx.run(`
            UNWIND $skills AS s
            MATCH (exp:Experience {id: s.experienceId})
            MERGE (skill:Skill {name: s.name})
            ON CREATE SET skill.type = s.type
            CREATE (exp)-[:BUILT_SKILL]->(skill)
          `, { skills: flattenedSkills });
        }

        // Insert Goal Contributions
        const flattenedGoals = [];
        for (const exp of journey.experiences) {
          if (exp.goalIds) {
            for (const goalId of exp.goalIds) {
              flattenedGoals.push({
                experienceId: exp.id,
                goalId: goalId,
              });
            }
          }
        }

        if (flattenedGoals.length > 0) {
          await tx.run(`
            UNWIND $contributions AS c
            MATCH (exp:Experience {id: c.experienceId})
            MATCH (g:Goal {id: c.goalId})
            CREATE (exp)-[:CONTRIBUTED_TO]->(g)
          `, { contributions: flattenedGoals });
        }
      }

      // 4. Insert Transitions
      if (journey.transitions && journey.transitions.length > 0) {
        await tx.run(`
          UNWIND $transitions AS t
          MATCH (e1:Experience {id: t.fromExperienceId})
          MATCH (e2:Experience {id: t.toExperienceId})
          CREATE (e1)-[:TRANSITION {decisionLabel: t.decisionLabel}]->(e2)
        `, { transitions: journey.transitions });
      }

    });

  } finally {
    await closeSession(session);
  }
}
