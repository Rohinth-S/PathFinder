import { getCommunityTopics } from "../../services/community.service.js";

export async function getTopics() {
  return getCommunityTopics();
}