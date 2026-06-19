import { Request, Response } from "express";
import { UserRating } from "../models/userRating.model";
import { User } from "../models/user.model";
import { createUserRatingSchema } from "../validators/userRating.validator";
import mongoose from "mongoose";

// POST /api/user-ratings
export const createOrUpdateRating = async (req: Request, res: Response) => {
  try {
    const reviewerId = (req.user?.id || req.id) as string;
    if (!reviewerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate body
    const validated = createUserRatingSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        message: validated.error.issues[0].message,
      });
    }

    const { revieweeId, rating, comment } = validated.data;

    if (reviewerId === revieweeId) {
      return res.status(400).json({ message: "Bạn không thể tự đánh giá chính mình" });
    }

    // Check if reviewee exists
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({ message: "Không tìm thấy người dùng được đánh giá" });
    }

    // Upsert rating
    const reviewerObjId = new mongoose.Types.ObjectId(reviewerId);
    const revieweeObjId = new mongoose.Types.ObjectId(revieweeId);

    const userRating = await UserRating.findOneAndUpdate(
      { reviewer: reviewerObjId, reviewee: revieweeObjId },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Đánh giá người dùng thành công",
      data: userRating,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/user-ratings/:userId
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const ratings = await UserRating.find({ reviewee: new mongoose.Types.ObjectId(userId) })
      .populate("reviewer", "fullName username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lấy danh sách đánh giá thành công",
      data: ratings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/user-ratings/:userId/stats
export const getUserRatingStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const stats = await UserRating.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$reviewee",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || { averageRating: 0, totalRatings: 0 };

    res.status(200).json({
      message: "Lấy thống kê đánh giá thành công",
      data: {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalRatings: result.totalRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
