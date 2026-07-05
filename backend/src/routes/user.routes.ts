import { Router } from "express";
import { requireAuth } from "@clerk/express";

import { updateProfileController, getUserJourneyController } from "../controllers/user.controller.js";

const router = Router();

router.patch("/profile", updateProfileController);
router.get("/journey", requireAuth(), getUserJourneyController);

export default router;