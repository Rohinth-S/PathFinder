import type { JourneyJson } from "../../types.js";
import type { NormalizerRule, NormalizationResult } from "../types.js";

export const deduplicateSkillsRule: NormalizerRule = {
  name: "deduplicateSkills",
  normalize(journey: JourneyJson): NormalizationResult {
    let appliedFixes = 0;

    if (!journey.experiences) {
      return { journey, appliedFixes: 0 };
    }

    const updatedExperiences = journey.experiences.map((exp) => {
      if (!exp.skills || exp.skills.length === 0) {
        return exp;
      }

      const seen = new Set<string>();
      const uniqueSkills = [];

      for (const skill of exp.skills) {
        if (skill.name) {
          const normalized = skill.name.trim().toLowerCase();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            uniqueSkills.push(skill);
          } else {
            appliedFixes++;
          }
        } else {
          uniqueSkills.push(skill);
        }
      }

      return {
        ...exp,
        skills: uniqueSkills,
      };
    });

    return {
      journey: {
        ...journey,
        experiences: updatedExperiences,
      },
      appliedFixes,
    };
  },
};
