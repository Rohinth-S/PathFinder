import { toggleUpvote } from "../../services/community.service.js";

export async function upvoteExperience(
  userId: string,
  experienceId: string
): Promise<{ upvoteCount: number; hasUpvoted: boolean }> {
  if (!userId) {
    throw new Error("userId is required to upvote.");
  }
  
  if (!experienceId) {
    throw new Error("experienceId is required.");
  }

  return toggleUpvote(userId, experienceId);
}
