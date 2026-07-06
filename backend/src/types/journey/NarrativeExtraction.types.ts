export interface ExtractedExperience {
  id: string;
  summary: string;
  chronology: number;
  inferredGoalTitles: string[];
  missingRequiredFields: string[];
  missingOptionalFields: string[];
}

export interface ExtractedTransition {
  fromExperienceId: string;
  toExperienceId: string;
  decisionSummary: string;
}

export interface SuggestedGoal {
  title: string;
  reasoning: string;
}

export interface NarrativeExtraction {
  experiences: ExtractedExperience[];
  transitions: ExtractedTransition[];
  suggestedGoals: SuggestedGoal[];
}