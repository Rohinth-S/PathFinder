import type { JourneyJson } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

export const missingTransitionsValidator: Validator = {
  name: "missingTransitions",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    const experiencesCount = journey.experiences ? journey.experiences.length : 0;
    const transitionsCount = journey.transitions ? journey.transitions.length : 0;

    if (experiencesCount > 1 && transitionsCount === 0) {
       issues.push({
         type: "missing_transition",
         severity: "warning",
         message: "The journey graph contains multiple experiences but no transitions connecting them.",
       });
     }


    return issues;
  },
};
