import type { RetrievedExperience, RetrievedGoal } from "../../services/graphExpansion.service.js";

const FOCUS_KEYWORDS: Record<string, string[]> = {
  products: ["product","mvp","prototype","launch","software","tool","application","platform","saas"],
  customer_acquisition: ["customer","customers","sales","acquisition","outreach","distribution","waitlist","growth"],
  career_transition: ["transition","pivot","switch","moved","career","role"],
  skills: ["skill","learned","mastered","developed","improved"],
  internships: ["internship","intern","summer","campus"],
  placements: ["placement","offer","interview","job","recruiter"],
  startup_growth: ["growth","scale","scaling","expansion","revenue"],
  fundraising: ["fundraising","funding","investor","angel","vc","venture"],
  product_market_fit: ["pmf","product market fit","retention","activation","paying customers"],
  leadership: ["leadership","team","manager","management","hiring"],
  ai_careers: ["ai","ml","machine learning","llm","artificial intelligence"],
  founding_journey: ["founder","startup","company","business","entrepreneur"],
  education: ["college","university","degree","education"],
  ms_applications: ["masters","ms","admit","sop","university"],
  competitions: ["competition","hackathon","olympiad","contest"],
  decision_patterns: ["decision","tradeoff","choice","pivot"],
};

export function applyFocusBoost(
  experience: RetrievedExperience,
  goals: RetrievedGoal[],
  focus: string,
  baseScore: number
): number {
  if (focus === "general") {
    return baseScore;
  }

  const keywords = FOCUS_KEYWORDS[focus] ?? [];

  const relatedGoals = goals.filter((goal) => experience.goalIds.includes(goal.id));

  const searchableText = [
    experience.title,
    experience.context,
    experience.challengeFaced,
    experience.outcome,
    experience.organization,
    experience.applicationStatus,
    ...(experience.achievements ?? []),
    ...experience.skillNames,
    ...experience.transitions.map(
      (transition) => transition.decisionLabel
    ),
    ...relatedGoals.map((goal) => goal.title),
    ...relatedGoals.map((goal) => goal.description),
    ...relatedGoals.map((goal) => goal.status),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let boost = 0;

  for (const keyword of keywords) {
    if (searchableText.includes(keyword.toLowerCase())) {
      boost += 0.05;
    }
  }

  return baseScore + Math.min(boost, 0.30);
}

export function matchesFocus(
  experience: RetrievedExperience,
  goals: RetrievedGoal[],
  focus: string
): boolean {

  if (focus === "general") {
    return true;
  }

  const keywords = FOCUS_KEYWORDS[focus] ?? [];
  const relatedGoals = goals.filter((goal) => experience.goalIds.includes(goal.id));

  const searchableText = [
    experience.title, experience.timelineSummary, experience.context, experience.challengeFaced, experience.outcome,
    ...(experience.achievements ?? []),
    ...experience.skillNames,
    ...relatedGoals.map(
      (goal) => goal.title),
    ...relatedGoals.map(
      (goal) => goal.description),
    ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some(
    (keyword) =>
      searchableText.includes(
        keyword.toLowerCase()
      )
  );
}