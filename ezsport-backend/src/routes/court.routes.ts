import express from "express";

import {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  suggestCourts,
  generateDescription,
  compareCourts,
} from "../controllers/court.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";
import { suggestCourtsValidator, compareCourtsValidator } from "../validators/court.validator";

import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.post("/ai/suggest", suggestCourtsValidator, suggestCourts as any);
router.post("/ai/compare", compareCourtsValidator, compareCourts as any);

// CRUD Routes
router.get("/", getCourts);
router.get("/:id", getCourtById);
router.post("/", verifyToken, authorizeRoles("owner"), upload.array("images", 5), createCourt);
router.put("/:id", verifyToken, authorizeRoles("owner"), upload.array("images", 5), updateCourt);
router.delete("/:id", verifyToken, authorizeRoles("owner"), deleteCourt);
router.post("/:id/ai/description", generateDescription as any);

export default router;
