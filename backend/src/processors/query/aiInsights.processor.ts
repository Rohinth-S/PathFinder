import type { QueryUnderstanding } from "./querySchema.js";
import type { RetrievedContext } from "./retrieveContext.processor.js";
import {generateAiInsights} from "../../services/aiInsights.service.js";
import type { AiInsights} from "./aiInsights.schema.js";
import type {JourneyStatistics} from "./journeyStatistics.processor.js";
import type {CommonPattern} from "./commonPatterns.processor.js";

export async function buildAiInsights(
  query: string,
  structuredQuery: QueryUnderstanding,
  context: RetrievedContext,
  journeyStatistics: JourneyStatistics,
  commonPatterns: CommonPattern[]
): Promise<AiInsights> {

  const experiences = context.experiences
  .slice(0, 25)
  .map((experience) => ({
    title: experience.title,
    context: experience.context,
    outcome: experience.outcome ?? null,
    timelineSummary: experience.timelineSummary,
  }));

  return generateAiInsights({
    query,
    queryType:
      structuredQuery.queryType,
    journeyStatistics,
    commonPatterns:
      commonPatterns.map((pattern) => ({title: pattern.title,description: pattern.description, frequency:pattern.frequency,
        })
      ),
    experiences,
  });
}