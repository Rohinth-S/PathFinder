import { Router } from "express";

import {
  getTopicsController,
  getSubtopicsController,
  searchCommunityController,
  getJourneyController,
  getFeedController,
  upvoteExperienceController,
  getGraphController
} from "../controllers/community.controller.js";

const router = Router();

router.get("/topics", getTopicsController);
router.get("/subtopics", getSubtopicsController);
router.get("/", searchCommunityController);
router.get("/feed", getFeedController);
router.get("/graph", getGraphController);
router.get("/journey/:username", getJourneyController);
router.post("/experience/:id/upvote", upvoteExperienceController);

export default router;