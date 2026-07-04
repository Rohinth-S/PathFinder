import type { JourneyJson, JourneyGoal } from "../types.js";
import type { Validator, StaticAnalysisIssue } from "../types.js";

const WORK_KEYWORDS = [
  "engineer", "developer", "designer", "manager", "intern", "co-founder", "job", 
  "work", "employment", "contractor", "lead", "architect", "specialist", "founder", 
  "vp", "cto", "ceo", "cfo", "coo", "associate", "analyst", "consultant", 
  "officer", "director", "developer", "tester", "researcher", "internship"
];

const WORK_SUBTOPICS = [
  "Software Engineering", "Product Management", "Data / AI", "Design", 
  "Sales / GTM", "Internship", "SaaS / Tech", "Fintech", "Edtech", 
  "Cracking Placements"
];

export const missingOrganizationsValidator: Validator = {
  name: "missingOrganizations",
  validate(journey: JourneyJson): StaticAnalysisIssue[] {
    const issues: StaticAnalysisIssue[] = [];

    const goalsMap = new Map<string, JourneyGoal>(
      journey.goals ? journey.goals.map((g) => [g.id, g]) : []
    );


    if (journey.experiences) {
      journey.experiences.forEach((exp) => {
        // Only run if organization is missing or empty
        if (!exp.organization || exp.organization.trim() === "") {
          let isWorkExperience = false;

          // 1. Check title and context keywords (case-insensitive)
          const searchString = `${exp.title} ${exp.context}`.toLowerCase();
          isWorkExperience = WORK_KEYWORDS.some((kw) => searchString.includes(kw));

          // 2. Check associated goals' subtopics if not already identified
          if (!isWorkExperience && exp.goalIds) {
            for (const goalId of exp.goalIds) {
              const goal = goalsMap.get(goalId);
              if (goal && goal.subtopics) {
                const hasWorkSubtopic = goal.subtopics.some((st) => WORK_SUBTOPICS.includes(st));
                if (hasWorkSubtopic) {
                  isWorkExperience = true;
                  break;
                }
              }
            }
          }

          if (isWorkExperience) {
            issues.push({
              type: "missing_organization",
              severity: "warning",
              nodeId: exp.id,
              field: "organization",
              message: `Work experience "${exp.title}" is missing the organization name.`,
            });
          }

        }
      });
    }

    return issues;
  },
};
