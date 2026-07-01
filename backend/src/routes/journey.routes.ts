import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { extractJourneyController } from "../controllers/journey.controller.js";

const router = Router();

router.post("/extract", requireAuth, extractJourneyController);

export default router;
