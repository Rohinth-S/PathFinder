import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const duplicateExperiencesValidator: Validator = {
  name: "duplicateExperiences",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    if (journey.experiences) {
      const seenByTitleAndOrg = new Map<string, string>(); // key -> id
      const seenByTitleAndStart = new Map<string, string>(); // key -> id
      const reportedPairs = new Set<string>();

      journey.experiences.forEach((exp) => {
        const titleNormalized = exp.title ? exp.title.trim().toLowerCase() : "";
        const orgNormalized = exp.organization ? exp.organization.trim().toLowerCase() : "";
        const startNormalized = exp.startDate ? exp.startDate.trim() : "";

        if (titleNormalized) {
          // Check duplicate by title & organization
          if (orgNormalized) {
            const keyOrg = `${titleNormalized}||${orgNormalized}`;
            const existingId = seenByTitleAndOrg.get(keyOrg);
            if (existingId) {
              const pairKey = [existingId, exp.id].sort().join("-");
              if (!reportedPairs.has(pairKey)) {
                issues.push({
                  type: "duplicate_experience",
                  severity: "warning",
                  nodeId: exp.id,
                  message: `Experience "${exp.title}" is duplicated (same title and organization as experience ID "${existingId}").`,
                });
                reportedPairs.add(pairKey);
              }
            } else {
              seenByTitleAndOrg.set(keyOrg, exp.id);
            }
          }

          // Check duplicate by title & startDate
          if (startNormalized) {
            const keyStart = `${titleNormalized}||${startNormalized}`;
            const existingId = seenByTitleAndStart.get(keyStart);
            if (existingId) {
              const pairKey = [existingId, exp.id].sort().join("-");
              if (!reportedPairs.has(pairKey)) {
                issues.push({
                  type: "duplicate_experience",
                  severity: "warning",
                  nodeId: exp.id,
                  message: `Experience "${exp.title}" is duplicated (same title and start date as experience ID "${existingId}").`,
                });
                reportedPairs.add(pairKey);
              }
            } else {
              seenByTitleAndStart.set(keyStart, exp.id);
            }
          }
        }

      });
    }

    return issues;
  },
};
