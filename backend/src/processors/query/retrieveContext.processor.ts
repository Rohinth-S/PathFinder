import { generateEmbedding }from "../../services/embeddings.service.js";
import { vectorSearchExperiences }from "../../services/vectorSearch.service.js";
import { retrieveUsersByGoals }from "../../services/userRetrieval.service.js";
import {retrieveJourneys,type RetrievedJourney} from "../../services/journeyRetrieval.service.js";
import {expandGraph,type RetrievedGoal,type RetrievedSkill,type RetrievedExperience} from "../../services/graphExpansion.service.js";
import type { QueryUnderstanding }from "./querySchema.js";
import { applyFocusBoost,matchesFocus } from "./focusBoosting.js";

export interface RetrievedContext {
  usernames: string[];
  journeys: RetrievedJourney[];
  experiences: RetrievedExperience[];
  goals: RetrievedGoal[];
  skills: RetrievedSkill[];
}

export async function retrieveContext(
  query: QueryUnderstanding
): Promise<RetrievedContext> {

  const usernames =await retrieveUsersByGoals(query.topics,query.subtopics);const journeys =await retrieveJourneys(usernames);
  const journeyExperienceIds =new Set<string>();

  for (const journey of journeys) {
    for (const experienceId of journey.experienceIds) {
      journeyExperienceIds.add(experienceId);
    }
  }

  const queryEmbedding =await generateEmbedding(query.semanticQuery);
  const vectorMatches =await vectorSearchExperiences(queryEmbedding,50);

  const scoreMap =new Map<string, number>();

  const candidateExperienceIds =vectorMatches
      .filter((match) =>journeyExperienceIds.has(match.experienceId))
      .map((match) => {scoreMap.set(match.experienceId,match.score);
        return match.experienceId;
      });

  const expandedGraph =await expandGraph(candidateExperienceIds);
  const focusFiltered = expandedGraph.experiences.filter((experience) => matchesFocus(experience, expandedGraph.goals, query.focus));
  const candidateExperiences = focusFiltered.length > 0 ? focusFiltered : expandedGraph.experiences;
  const experiences = candidateExperiences .map((experience) => ({
      
      ...experience,

      score: applyFocusBoost(
        experience,
        expandedGraph.goals,
        query.focus,
        scoreMap.get(
          experience.id
        ) ?? 0
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score
    );

  const bestScore = experiences[0]?.score ?? 0;
  const threshold = bestScore * 0.85;
  const filteredExperiences = experiences.filter((experience) =>experience.score >= threshold);

  return {
    usernames,
    journeys,
    experiences: filteredExperiences,
    goals: expandedGraph.goals,
    skills: expandedGraph.skills,
  };
}