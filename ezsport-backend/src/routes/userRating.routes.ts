import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  createOrUpdateRating,
  getUserRatings,
  getUserRatingStats,
} from "../controllers/userRating.controller";

const router = Router();

// Public / Protected depending on action
router.get("/:userId", getUserRatings);
router.get("/:userId/stats", getUserRatingStats);
router.post("/", verifyToken, createOrUpdateRating);

export default router;
