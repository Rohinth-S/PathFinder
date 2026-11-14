import type { RetrievedContext } from "../processors/query/retrieveContext.processor.js";
import type { RetrievedExperience } from "./graphExpansion.service.js";

export interface MinedJourneyPattern {
  pattern: string;
  frequency: number;
}

function buildExperienceMap(
  experiences: RetrievedExperience[]
): Map<string, RetrievedExperience> {
  return new Map(
    experiences.map((experience) => [
      experience.id,
      experience,
    ])
  );
}

function findTransitionLabel(
  current: RetrievedExperience,
  nextExperienceId: string
): string | null {
    
    const transition = current.transitions.find((transition) => transition.toExperienceId ===nextExperienceId);
    return (transition?.decisionLabel ?? null);
}

export function mineJourneyPatterns(
  context: RetrievedContext
): MinedJourneyPattern[] {

  const experienceMap = buildExperienceMap(context.experiences);

  const patternCounts = new Map<string, number>();

  for (const journey of context.journeys) {

    const orderedExperiences = journey.experienceIds
        .map((id) => experienceMap.get(id))
        .filter((experience): experience is RetrievedExperience =>Boolean(experience))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    for (let i = 0;i < orderedExperiences.length - 1;i++) {
        const current = orderedExperiences[i]!;
        const next = orderedExperiences[i + 1]!;
        const transition12 = findTransitionLabel(current, next.id );
        const currentLabel = current.timelineSummary;
        const nextLabel = next.timelineSummary;
        const twoHop = transition12 ? `${currentLabel} → ${transition12} → ${nextLabel}` : `${currentLabel} → ${nextLabel}`;
        patternCounts.set(twoHop,(patternCounts.get(twoHop) ?? 0) + 1
      );
      if (i + 2 < orderedExperiences.length) {
         const third = orderedExperiences[i + 2]!;
         const transition23 = findTransitionLabel(next,third.id);
         const thirdLabel = third.timelineSummary;
         const threeHop =[currentLabel, transition12, nextLabel, transition23, thirdLabel]
            .filter(Boolean)
            .join(" → ");
         patternCounts.set(threeHop,(patternCounts.get(threeHop) ?? 0) + 1);
      }
    }
  }

  return [...patternCounts.entries()]
    .map(([pattern, frequency]) => ({pattern,frequency,}))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);
}