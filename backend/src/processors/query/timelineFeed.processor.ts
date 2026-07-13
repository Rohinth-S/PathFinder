import type { RetrievedContext } from "./retrieveContext.processor.js";
import type { JourneyExperience, JourneyTransition } from "../journey/journeySchema.js";

import type { RetrievedExperience, RetrievedGoal } from "../../services/graphExpansion.service.js";
import type { JourneyGoal } from "../../types/journey/Journey.types.js";


export interface RelevantJourney {
  username: string;
  imageUrl: string | null;
  summary: string;
  expertiseAreas: string[];
  expandedDetails: {
    goals: JourneyGoal[];
    experiences: Omit<JourneyExperience, "proofs">[];
    transitions: JourneyTransition[];
  };
}

export function buildTimelineFeed(
  context: RetrievedContext
): RelevantJourney[] {
  const experienceMap = new Map(
    context.experiences.map((experience) => [
      experience.id,
      experience,
    ])
  );

  return context.journeys.map((journey) => {
    const experiences: Omit<JourneyExperience, "proofs">[] =
      journey.experienceIds
        .map((id) => experienceMap.get(id))
        .filter(
          (
            experience
          ): experience is RetrievedExperience =>
            Boolean(experience)
        )
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() -
            new Date(b.startDate).getTime()
        )
        .map((experience) => ({
          id: experience.id,
          title: experience.title,
          startDate: experience.startDate,
          endDate: experience.endDate ?? null,
          context: experience.context,
          challengeFaced:
            experience.challengeFaced ?? null,
          outcome:
            experience.outcome ?? null,
          organization:
            experience.organization ?? null,
          applicationStatus:
            experience.applicationStatus ?? null,
          achievements:
            experience.achievements ?? null,
          isVerified:
            experience.isVerified,
          timelineSummary:
            experience.timelineSummary,
          goalIds:
            experience.goalIds,
          skills: experience.skills,
        }));

    const relevantGoalIds = new Set(
      experiences.flatMap(
        (experience) => experience.goalIds
      )
    );

    const goals: JourneyGoal[] = context.goals.filter((goal) =>
      relevantGoalIds.has(goal.id)
    );

    const transitions: JourneyTransition[] =
      experiences.flatMap((experience) =>
        experienceMap
          .get(experience.id)!
          .transitions.filter((transition) =>
            journey.experienceIds.includes(
              transition.toExperienceId
            )
          )
          .map((transition) => ({
            fromExperienceId:
              experience.id,
            toExperienceId:
              transition.toExperienceId,
            decisionLabel:
              transition.decisionLabel,
          }))
      );

    return {
      username: journey.username,
      imageUrl: journey.imageUrl,
      summary: journey.summary,
      expertiseAreas:
        journey.expertiseAreas,

      expandedDetails: {
        goals,
        experiences,
        transitions,
      },
    };
  });
}