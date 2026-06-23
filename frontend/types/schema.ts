export interface StructuredQuery {
  queryType: string;
  topics: string[];
  subtopics: string[];
  skills: string[];
  semanticQuery: string;
  focus: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'achieved' | 'pending' | string;
}

export interface Transition {
  decisionLabel: string;
  toExperienceId: string;
}

export interface ExpandedDetails {
  context: string;
  challengeFaced: string;
  outcome: string;
  achievements: string | null;
  applicationStatus: string | null;
  goals: Goal[];
  skills: string[];
  transitions: Transition[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  organization: string;
  isVerified: boolean;
  timelineSummary: string;
  expandedDetails: ExpandedDetails;
}

export interface UserTrajectory {
  username: string;
  reputationScore: number;
  timeline: TimelineEvent[];
}

export interface CommonPattern {
  title: string;
  description: string;
  frequency: number;
  percentage: number;
}

export interface AiInsights {
  directAnswer: string;
  keyPoints: string[];
  actionableTakeaway: string;
}

export interface AggregatedContext {
  journeyStatistics: {
    usersAnalyzed: number;
    experiencesAnalyzed: number;
  };
  timelineFeed: UserTrajectory[];
  commonPatterns: CommonPattern[];
  aiInsights: AiInsights;
}

export interface DecisionAtlasBackendResponse {
  structuredQuery: {
    [key: string]: any;
  };
  aggregatedContext: AggregatedContext;
}
