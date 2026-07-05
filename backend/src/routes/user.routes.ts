import { Router } from "express";

import { updateProfileController } from "../controllers/user.controller.js";

const router = Router();

router.patch("/profile",updateProfileController);

export default router;