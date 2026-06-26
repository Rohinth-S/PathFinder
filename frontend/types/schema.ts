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
  emotionNote: string | null;
  goals: Goal[];
  skills: string[];
  transitions: Transition[];
}

export type NodeType = 'Education' | 'Job' | 'Decision' | 'Failure' | 'Startup' | 'Achievement';
export type EmotionLabel = 'Confident' | 'Uncertain' | 'Pivoting' | 'Pushing through' | string;

export interface TimelineEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  organization: string;
  isVerified: boolean;
  timelineSummary: string;
  nodeType: NodeType;
  emotionLabel: EmotionLabel;
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

export interface JourneyStatistics {
  usersAnalyzed: number;
  experiencesAnalyzed: number;
  pathSplit: { workedFirst: number; startedDirectly: number };
  averageTimeToRevenue: number;
}

export interface AggregatedContext {
  journeyStatistics: JourneyStatistics;
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
