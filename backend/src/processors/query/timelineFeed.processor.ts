import type {RetrievedContext} from "./retrieveContext.processor.js";

import type {RetrievedExperience,RetrievedGoal} from "../../services/graphExpansion.service.js";

export interface TimelineExpandedDetails {
  context: string;
  challengeFaced: string | null;
  outcome: string | null;
  achievements: string[] | null;
  applicationStatus: string | null;
  goals: {
    id: string;
    title: string;
    description: string;
    status: string;
  }[];

  skills: string[];
  transitions: {
    toExperienceId: string;
    decisionLabel: string;
  }[];
}

export interface TimelineNode {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  organization: string | null;
  isVerified: boolean;
  timelineSummary: string;
  expandedDetails: TimelineExpandedDetails;
}

export interface JourneyTimeline {
  username: string;
  reputationScore: number;
  timeline: TimelineNode[];
}

function buildGoalMap(
  goals: RetrievedGoal[]
): Map<string, RetrievedGoal> {
  return new Map(
    goals.map((goal) => [
      goal.id,
      goal,
    ])
  );
}

function buildTimelineNode(
  experience: RetrievedExperience,
  goalMap: Map<string, RetrievedGoal>
): TimelineNode {
  return {
    id: experience.id,

    title: experience.title,

    startDate:
      experience.startDate,

    endDate:
      experience.endDate ?? null,

    organization:
      experience.organization ?? null,

    isVerified:
      experience.isVerified,

    timelineSummary: experience.timelineSummary,

    expandedDetails: {
      context:
        experience.context,

      challengeFaced:
        experience.challengeFaced ??
        null,

      outcome:
        experience.outcome ??
        null,

      achievements:
        experience.achievements ??
        null,

      applicationStatus:
        experience.applicationStatus ??
        null,

      goals:
        experience.goalIds
          .map((goalId) =>
            goalMap.get(goalId)
          )
          .filter(
            (
              goal
            ): goal is RetrievedGoal =>
              Boolean(goal)
          )
          .map((goal) => ({
            id: goal.id,
            title: goal.title,
            description:
              goal.description,
            status:
              goal.status,
          })),

      skills:
        experience.skillNames,

      transitions:
        experience.transitions,
    },
  };
}

export function buildTimelineFeed(
  context: RetrievedContext
): JourneyTimeline[] {
  const goalMap = buildGoalMap(context.goals);

  const experienceMap = new Map(context.experiences.map((experience) => [experience.id,experience,]));

  return context.journeys.map((journey) => {
      const timeline =journey.experienceIds
          .map((experienceId) =>experienceMap.get(experienceId))
          .filter((experience): experience is RetrievedExperience =>Boolean(experience))
          .sort((a, b) =>
              new Date(a.startDate).getTime() -
              new Date(b.startDate).getTime())
          .map((experience) =>buildTimelineNode(experience,goalMap));

      return {
        username:
          journey.username,

        reputationScore:
          0,

        timeline,
      };
    }
  );
}