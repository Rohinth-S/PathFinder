import type { JourneyJson } from "../../types.js";
import type { NormalizerRule, NormalizationResult } from "../types.js";

export const deduplicateRelationshipsRule: NormalizerRule = {
  name: "deduplicateRelationships",
  normalize(journey: JourneyJson): NormalizationResult {
    let appliedFixes = 0;

    // 1. Deduplicate goalIds in each experience
    let updatedExperiences = journey.experiences;
    if (journey.experiences) {
      updatedExperiences = journey.experiences.map((exp) => {
        if (!exp.goalIds || exp.goalIds.length === 0) {
          return exp;
        }

        const seenGoals = new Set<string>();
        const uniqueGoalIds = [];

        for (const goalId of exp.goalIds) {
          const trimmed = goalId.trim();
          if (!seenGoals.has(trimmed)) {
            seenGoals.add(trimmed);
            uniqueGoalIds.push(trimmed);
          } else {
            appliedFixes++;
          }
        }

        return {
          ...exp,
          goalIds: uniqueGoalIds,
        };
      });
    }

    // 2. Deduplicate transitions
    let updatedTransitions = journey.transitions;
    if (journey.transitions) {
      const seenTransitions = new Set<string>();
      const uniqueTransitions = [];

      for (const trans of journey.transitions) {
        const from = trans.fromExperienceId ? trans.fromExperienceId.trim() : "";
        const to = trans.toExperienceId ? trans.toExperienceId.trim() : "";
        const label = trans.decisionLabel ? trans.decisionLabel.trim().toLowerCase() : "";

        const key = `${from}||${to}||${label}`;

        if (!seenTransitions.has(key)) {
          seenTransitions.add(key);
          uniqueTransitions.push(trans);
        } else {
          appliedFixes++;
        }
      }

      updatedTransitions = uniqueTransitions;
    }

    return {
      journey: {
        ...journey,
        experiences: updatedExperiences,
        transitions: updatedTransitions,
      },
      appliedFixes,
    };
  },
};
