import express from "express";
import {
  getPlaymates,
  createPlaymate,
  joinPlaymate,
  leavePlaymate,
  deletePlaymate,
} from "../controllers/playmate.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Public route: view playmate list
router.get("/", getPlaymates as any);

// Protected routes (requires login)
router.post("/", verifyToken as any, createPlaymate as any);
router.post("/:id/join", verifyToken as any, joinPlaymate as any);
router.post("/:id/leave", verifyToken as any, leavePlaymate as any);
router.delete("/:id", verifyToken as any, deletePlaymate as any);

export default router;
