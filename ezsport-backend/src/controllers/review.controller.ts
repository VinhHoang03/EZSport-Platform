import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review.model";
import Venue from "../models/venue.model";
import Booking from "../models/booking.model";
import Court from "../models/court.model";

async function syncVenueRating(venueId: string) {
  const agg = await Review.aggregate([
    { $match: { venueId: new mongoose.Types.ObjectId(venueId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg   = agg[0]?.avg   ?? 0;
  const count = agg[0]?.count ?? 0;
  await Venue.findByIdAndUpdate(venueId, {
    rating:       Math.round(avg * 10) / 10,
    reviewsCount: count,
  });
}

// GET /api/reviews/venue/:venueId
export const getVenueReviews = async (req: Request, res: Response) => {
  try {
    const venueId = String(req.params.venueId);
    const page  = Math.max(1, parseInt(String(req.query.page  ?? 1)));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? 10))));
    const skip  = (page - 1) * limit;

    const [reviews, total, agg] = await Promise.all([
      Review.find({ venueId })
        .populate("userId", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ venueId }),
      Review.aggregate([
        { $match: { venueId: new mongoose.Types.ObjectId(venueId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    agg.forEach((r: any) => { breakdown[r._id] = r.count; });

    res.json({
      message: "Fetch reviews success",
      data: reviews,
      breakdown,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/reviews/venue/:venueId
export const createReview = async (req: Request, res: Response) => {
  try {
    const venueId = String(req.params.venueId);
    const userId = (req as any).user?.id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "rating và comment là bắt buộc" });
    }

    // Validate: user must have at least one COMPLETED booking at this venue
    const courtIds = await Court.find({ venue: venueId }).distinct("_id");
    if (!courtIds.length) {
      return res.status(400).json({ message: "Không tìm thấy sân thuộc cơ sở này" });
    }

    const hasCompleted = await Booking.exists({
      userId,
      courtId: { $in: courtIds },
      status: "COMPLETED",
    });

    if (!hasCompleted) {
      return res.status(403).json({
        message: "Bạn cần hoàn thành ít nhất một lịch đặt tại sân này trước khi đánh giá",
      });
    }

    const existing = await Review.findOne({ venueId, userId });
    if (existing) {
      return res.status(409).json({ message: "Bạn đã đánh giá sân này rồi" });
    }

    const review = await Review.create({ venueId, userId, rating, comment });
    await syncVenueRating(venueId);

    const populated = await Review.findById(review._id).populate("userId", "fullName avatar");
    res.status(201).json({ message: "Tạo đánh giá thành công", data: populated });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bạn đã đánh giá sân này rồi" });
    }
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/reviews/:reviewId
export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const reviewId = String(req.params.reviewId);
    const { rating, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    if (rating)  review.rating  = rating;
    if (comment) review.comment = comment;
    await review.save();
    await syncVenueRating(String(review.venueId));

    const populated = await Review.findById(review._id).populate("userId", "fullName avatar");
    res.json({ message: "Cập nhật đánh giá thành công", data: populated });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const reviewId = String(req.params.reviewId);

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    const venueId = String(review.venueId);
    await review.deleteOne();
    await syncVenueRating(venueId);

    res.json({ message: "Xóa đánh giá thành công" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/me
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const reviews = await Review.find({ userId })
      .populate("venueId", "name image location")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ message: "Fetch my reviews success", data: reviews });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/venue/:venueId/can-review
export const checkCanReview = async (req: Request, res: Response) => {
  try {
    const venueId = String(req.params.venueId);
    const userId = (req as any).user?.id;

    const courtIds = await Court.find({ venue: venueId }).distinct("_id");
    if (!courtIds.length) {
      return res.status(200).json({ canReview: false, reason: "no_courts" });
    }

    const hasCompleted = await Booking.exists({
      userId,
      courtId: { $in: courtIds },
      status: "COMPLETED",
    });

    if (!hasCompleted) {
      return res.status(200).json({ canReview: false, reason: "no_completed_booking" });
    }

    const alreadyReviewed = await Review.exists({ venueId, userId });
    if (alreadyReviewed) {
      return res.status(200).json({ canReview: false, reason: "already_reviewed" });
    }

    res.json({ canReview: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
