import { Router } from "express";
import multer from "multer";

import { queryController } from "../controllers/query.controller.js";

const router = Router();

const upload = multer({storage: multer.memoryStorage(),});

router.post("/query", upload.single("audio"), queryController);

export default router;