import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import { updateProfileController, getJourneyController, } from "../controllers/user.controller.js";

const router = Router();

router.patch("/profile", requireAuth, updateProfileController);
router.get("/journey", requireAuth, getJourneyController);

export default router;