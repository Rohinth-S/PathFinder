import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import { updateProfileController } from "../controllers/user.controller.js";

const router = Router();

router.patch("/profile", requireAuth, updateProfileController);

export default router;