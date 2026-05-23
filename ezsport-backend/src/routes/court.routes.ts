import express from "express";
import { 
  getCourts, 
  createCourt, 
  deleteCourt, 
  checkIn,
  suggestCourts,
  generateDescription,
  compareCourts
} from "../controllers/court.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { suggestCourtsValidator, compareCourtsValidator } from "../validators/court.validator";

import upload from "../middlewares/upload.middleware";

const router = express.Router();

// ✅ AI Routes phải đặt TRƯỚC dynamic routes (/:id) để tránh "ai" bị match như :id
router.post("/ai/suggest", suggestCourtsValidator, suggestCourts as any); // Gợi ý sân dựa trên prompt
router.post("/ai/compare", compareCourtsValidator, compareCourts as any); // So sánh nhiều sân

// CRUD Routes
router.get("/", getCourts);
router.post("/", upload.single("image"), createCourt);
router.delete("/:id", deleteCourt);
router.post("/:id/check-in", verifyToken as any, checkIn as any);
router.post("/:id/ai/description", generateDescription as any); // Tạo mô tả bằng AI

export default router;
