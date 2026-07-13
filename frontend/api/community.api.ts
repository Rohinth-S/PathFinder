import { apiFetch } from "./api";

export interface SearchCommunityUser {
  username: string;
  summary: string | null;
  expertiseAreas: string[] | null;
  reputationScore: number;
  matchingGoalCount: number;
  matchingGoalTitles: string[];
  journeyHighlights: string[];
}

export interface CommunityJourney {
  user: {
    username: string;
    avatarUrl?: string | null;
    reputationScore: number;
  };
  goals: {
    id: string;
    title: string;
    description: string;
    status: string;
    topics: string[];
    subtopics: string[];
    startDate: string | null;
    endDate: string | null;
  }[];
  experiences: {
    id: string;
    title: string;
    timelineSummary: string;
    startDate: string | null;
    endDate: string | null;
    context: string;
    challengeFaced: string | null;
    outcome: string | null;
    organization: string;
    applicationStatus: string | null;
    achievements: string[] | null;
    isVerified: boolean;
    upvoteCount: number;
    hasUpvoted: boolean;
    skills: { name: string; type: string | null }[];
    goals: { id: string; title: string }[];
    transition: { toExperienceId: string; decisionLabel: string | null } | null;
  }[];
}

export async function getTopics(): Promise<string[]> {
  const data = await apiFetch<{ topics: string[] }>("/community/topics", { method: "GET" });
  return data.topics;
}

export interface GraphNode {
  id: string;
  title: string;
  authorUsername: string;
  upvoteCount: number;
}

export interface GraphEdge {
  fromId: string;
  toId: string;
  label: string | null;
}

export interface CommunityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getCommunityGraph(limit = 20): Promise<CommunityGraph> {
  return apiFetch<CommunityGraph>(`/community/graph?limit=${limit}`, { method: "GET" });
}

export async function getSubtopics(topic: string): Promise<string[]> {
  const data = await apiFetch<{ subtopics: string[] }>(`/community/subtopics?topic=${encodeURIComponent(topic)}`, { method: "GET" });
  return data.subtopics;
}

export async function searchCommunity(params: {
  topic?: string;
  subtopic?: string;
  page?: number;
  limit?: number;
}): Promise<SearchCommunityUser[]> {
  const query = new URLSearchParams();
  if (params.topic) query.append("topic", params.topic);
  if (params.subtopic) query.append("subtopic", params.subtopic);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  
  const queryString = query.toString();
  return apiFetch<SearchCommunityUser[]>(`/community${queryString ? `?${queryString}` : ""}`, { method: "GET" });
}

export async function getCommunityJourney(username: string): Promise<CommunityJourney> {
  return apiFetch<CommunityJourney>(`/community/journey/${encodeURIComponent(username)}`, { method: "GET" });
}

export interface FeedExperience {
  id: string;
  title: string;
  context: string;
  outcome: string | null;
  isVerified: boolean;
  startDate: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  authorUsername: string;
  authorSummary: string;
}

export async function getGlobalFeed(token?: string, page = 1, limit = 20): Promise<FeedExperience[]> {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  return apiFetch<FeedExperience[]>(`/community/feed?${query.toString()}`, { 
    method: "GET",
    headers 
  });
}

export async function toggleUpvote(token: string, experienceId: string): Promise<{ upvoteCount: number; hasUpvoted: boolean }> {
  return apiFetch<{ upvoteCount: number; hasUpvoted: boolean }>(`/community/experience/${experienceId}/upvote`, { 
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}
