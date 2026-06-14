import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  getVenueReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  checkCanReview,
} from "../controllers/review.controller";

const router = Router();

// Public
router.get("/venue/:venueId", getVenueReviews);

// Protected
router.use(verifyToken);
router.get("/me", getMyReviews);
router.get("/venue/:venueId/can-review", checkCanReview);
router.post("/venue/:venueId", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
