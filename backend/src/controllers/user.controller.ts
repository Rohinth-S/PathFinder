import type { Request, Response } from "express";
import { updateProfile, getUserJourney, } from "../services/user.service.js";

export async function updateProfileController(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const userId = req.userId;
    const { username, preferredLanguage } = req.body;
    const user = await updateProfile({
      clerkId: userId,
      username: username ?? null,
      preferredLanguage: preferredLanguage ?? null,
    });
    res.json(user);

  } catch (error) {

    const message = error instanceof Error ? error.message : String(error);

    res.status(500).json({ error: message });

  }
}

export async function getJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;

    const journey = await getUserJourney(userId);

    res.json(journey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    res.status(500).json({
      error: message,
    });
  }
}