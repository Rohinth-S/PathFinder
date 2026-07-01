import type { Request, Response } from "express";
import { clerkClient } from "@clerk/express";

import { syncUser } from "../services/auth.service.js";

export async function syncUserController(
  req: Request,
  res: Response
): Promise<void> {

  try {
   const userId = req.userId;

    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress;

    if (!email) {
      res.status(400).json({
        error: "User has no primary email",
      });
      return;
    }

    const syncedUser = await syncUser(user.id,email);
    res.json(syncedUser);

  } catch (error) {

    const message = error instanceof Error? error.message : String(error);
    res.status(500).json({error: message});

  }
}