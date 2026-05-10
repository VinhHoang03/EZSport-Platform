import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getProfile } from "../controllers/user.controller";
import { updateProfile } from "../controllers/user.controller";

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;






