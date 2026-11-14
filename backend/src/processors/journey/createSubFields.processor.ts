import { closeSession, getSession } from "../../services/neo4j.service.js";
import type { JourneyExperience,JourneyTransition, } from "../../types/journey/Journey.types.js";
import {upsertExperience,connectExperienceGoals,connectExperienceSkills, upsertExperienceProofs, upsertTransition,} from "./createGraph.processor.js";


export async function createExperiences(
  username: string,
  experiences: JourneyExperience[]
): Promise<void> {
  const session = getSession();
  const tx = session.beginTransaction();
  try {
    for (const [index, experience] of experiences.entries()) {
      await upsertExperience(tx,username,experience,index);
    }
    for (const experience of experiences) {
      await connectExperienceGoals(tx,experience);
      await connectExperienceSkills(tx,experience);
      await upsertExperienceProofs(tx,experience);
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await closeSession(session);
  }
}

export async function createTransitions(
  transitions: JourneyTransition[]
): Promise<void> {
  const session = getSession();
  const tx = session.beginTransaction();
  try {
    for (const transition of transitions) {
      await upsertTransition(tx, transition);
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await closeSession(session);
  }
}