import { Router } from "express";

import {getTopicsController,getSubtopicsController,searchCommunityController,getJourneyController} from "../controllers/community.controller.js";

const router = Router();

router.get("/topics", getTopicsController);

router.get("/subtopics", getSubtopicsController);

router.get("/", searchCommunityController);

router.get("/journey/:username", getJourneyController);

export default router;