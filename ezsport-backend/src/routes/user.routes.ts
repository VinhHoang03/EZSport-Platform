import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getMe, updateProfile, getShops } from "../controllers/user.controller";
import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/me", verifyToken as any, getMe as any);
router.put("/me", verifyToken as any, upload.single("avatar"), updateProfile as any);
router.get("/shops", getShops);

export default router;
