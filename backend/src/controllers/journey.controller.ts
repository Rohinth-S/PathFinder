import type { Request, Response } from "express";
import { startJourney } from "../processors/journey/startJourney.processor.js";
import { submitGoal } from "../processors/journey/submitGoal.processor.js";
import { continueJourney } from "../processors/journey/continueJourney.processor.js";
import { submitJourney } from "../processors/journey/submitJourney.processor.js";

export async function startJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) { res.status(401).json({error: "Unauthorized",});
    return;
    }
    const message = await startJourney(userId);

    res.json({
      success: true,
      message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({error: message});
  }
}

export async function continueJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { conversationId, message } = req.body;
    if (!conversationId || typeof conversationId !== "string") {
      res.status(400).json({error: "conversationId is required"});
      return;
    }
    if (!message || typeof message !== "string") {
      res.status(400).json({error: "message is required"});
      return;
    }
    const response = await continueJourney(conversationId,message);

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : String(error);

    res.status(500).json({
      error: msg,
    });
  }
}

export async function submitGoalController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { goal } = req.body;
    if (!goal) {
      res.status(400).json({
        error: "goal is required",
      });
      return;
    }
    const createdGoal = await submitGoal(req.userId,goal);
    res.json({
      success: true,
      goal: createdGoal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({error: message});
  }
}

export async function submitJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }
    const result = await submitJourney(userId,req.body);
    res.json({success: true,...result,});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({error: message});
  }
}