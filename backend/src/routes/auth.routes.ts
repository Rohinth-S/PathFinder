import { Router } from "express";

import { syncUserController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/sync",requireAuth, syncUserController);

export default router;