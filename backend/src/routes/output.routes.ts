import { Router } from "express";

import {translateController,speechController} from "../controllers/output.controller.js";

const router = Router();

router.post("/translate",translateController);

router.post("/speech",speechController);

export default router;