import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { getMe, updateProfile } from "../controllers/user.controller";
import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/me", verifyToken as any, getMe as any);
router.put("/me", verifyToken as any, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "bankQrCode", maxCount: 1 }]), updateProfile as any);

export default router;
