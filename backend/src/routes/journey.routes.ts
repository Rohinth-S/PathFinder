import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { extractJourneyController } from "../controllers/journey.controller.js";

const router = Router();

router.post("/extract", requireAuth(), extractJourneyController);

export default router;
