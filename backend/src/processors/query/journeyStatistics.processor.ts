import type { RetrievedContext } from "./retrieveContext.processor.js";

export interface JourneyStatistics {
  usersAnalyzed: number;
  experiencesAnalyzed: number;
}

export function buildJourneyStatistics(
  context: RetrievedContext
): JourneyStatistics {
  return {
    usersAnalyzed: context.usernames.length,
    experiencesAnalyzed: context.experiences.length,
  };
}