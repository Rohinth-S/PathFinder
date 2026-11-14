import { Router } from "express";

import {translateController,speechController} from "../controllers/output.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/translate", requireAuth, translateController);

router.post("/speech", requireAuth, speechController);

export default router;