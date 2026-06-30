import { getCommunitySubtopics } from "../../services/community.service.js";

export async function getSubtopics(
  topic: string
) {
  return getCommunitySubtopics(topic);
}