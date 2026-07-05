import type { Request, Response } from "express";
import { updateProfile } from "../services/user.service.js";
import { retrieveUserGraph } from "../services/userGraphRetrieval.service.js";
import { getAuthenticatedUserId } from "../utils/auth.js";

export async function updateProfileController(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const userId = getAuthenticatedUserId(req);
    const {username,preferredLanguage} = req.body;
    const user = await updateProfile({ clerkId: userId, username,preferredLanguage});
    res.json(user);

  } catch (error) {

    const message = error instanceof Error ? error.message: String(error);

    res.status(500).json({error: message});

  }
}

export async function getUserJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await retrieveUserGraph(userId);

    if (!result.journey) {
      res.json({ journey: null, metadata: {} });
      return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}