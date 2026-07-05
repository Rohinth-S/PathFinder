import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { startJourneyController, continueJourneyController, submitGoalController,submitJourneyController } from "../controllers/journey.controller.js";

const router = Router();
router.post("/start", requireAuth, startJourneyController);
router.post("/message", requireAuth, continueJourneyController);
router.post("/submit/goal",requireAuth,submitGoalController);
router.post("/submit", requireAuth, submitJourneyController);


export default router;
