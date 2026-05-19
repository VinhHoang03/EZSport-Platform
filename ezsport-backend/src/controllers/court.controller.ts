import { Request, Response } from "express";
import Court from "../models/court.model";
import User from "../models/user.model";
import CheckIn from "../models/checkin.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { calculateDistance } from "../utils/distance.util";

export const getCourts = async (req: Request, res: Response) => {
  try {
    const courts = await Court.find({ isActive: true });
    res.status(200).json({
      message: "Fetch courts success",
      data: courts
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // courtId
    const { userLat, userLng } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    // 1. Kiểm tra khoảng cách (Ví dụ: < 0.2km = 200m)
    const distance = calculateDistance(userLat, userLng, court.lat, court.lng);
    if (distance > 0.2) {
      return res.status(400).json({ 
        message: "Bạn quá xa sân để check-in",
        distance: distance.toFixed(2) + " km"
      });
    }

    // 2. Kiểm tra xem hôm nay đã check-in chưa
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckIn = await CheckIn.findOne({
      user: userId,
      court: id,
      createdAt: { $gte: today }
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: "Hôm nay bạn đã check-in tại sân này rồi" });
    }

    // 3. Cộng điểm cho User (Ví dụ: 50 điểm)
    const pointsToReward = 50;
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: pointsToReward }
    });

    // 4. Lưu lịch sử check-in
    const newCheckIn = new CheckIn({
      user: userId,
      court: id,
      pointsEarned: pointsToReward,
      location: { lat: userLat, lng: userLng }
    });
    await newCheckIn.save();

    res.status(200).json({
      message: "Check-in thành công!",
      pointsEarned: pointsToReward,
      totalPoints: (await User.findById(userId))?.loyaltyPoints
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourt = async (req: Request, res: Response) => {
  try {
    const newCourt = new Court(req.body);
    await newCourt.save();
    res.status(201).json({
      message: "Create court success",
      data: newCourt
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourt = async (req: Request, res: Response) => {
  try {
    await Court.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete court success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
