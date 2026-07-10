import type { QueryUnderstanding } from "./querySchema.js";
import type { RetrievedContext } from "./retrieveContext.processor.js";
import {buildJourneyStatistics,type JourneyStatistics,} from "./journeyStatistics.processor.js";
import {buildTimelineFeed,type  RelevantJourney,} from "./timelineFeed.processor.js";
import {buildCommonPatterns,type CommonPattern,} from "./commonPatterns.processor.js";
import {buildAiInsights,} from "./aiInsights.processor.js";
import type {AiInsights} from "./aiInsights.schema.js";

export interface AggregatedContext {
  journeyStatistics: JourneyStatistics;
  timelineFeed: RelevantJourney[];
  commonPatterns: CommonPattern[];
  aiInsights: AiInsights;
}

export async function aggregateContext(
  rawQuery: string,
  structuredQuery: QueryUnderstanding,
  context: RetrievedContext
): Promise<AggregatedContext> {

  const journeyStatistics =buildJourneyStatistics(context);
  const timelineFeed =buildTimelineFeed(context);
  const commonPatterns = await buildCommonPatterns(context);
  const aiInsights = await buildAiInsights(rawQuery, structuredQuery, context, journeyStatistics, commonPatterns);

  return {
    journeyStatistics,
    timelineFeed,
    commonPatterns,
    aiInsights,
  };
}