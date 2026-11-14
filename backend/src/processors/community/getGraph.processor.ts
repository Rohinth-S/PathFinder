import { getTrendingGraph, type GraphNode, type GraphEdge } from "../../services/community.service.js";

export async function getGraph(limit = 20): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  return getTrendingGraph(limit);
}
