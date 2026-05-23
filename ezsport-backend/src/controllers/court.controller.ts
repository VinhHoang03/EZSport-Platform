import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Court from "../models/court.model";
import { User } from "../models/user.model";
import CheckIn from "../models/checkin.model";
import { calculateDistance } from "../utils/distance.util";
import { CourtService } from "../services/court.service";

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

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // courtId
        const { userLat, userLng } = req.body;
        const userId = req.user?.id;

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
            totalPoints: (await User.findById(userId) as any)?.loyaltyPoints
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCourt = async (req: Request, res: Response) => {
  try {
    const courtData = { ...req.body };
    if (req.file && req.file.path) {
      courtData.image = req.file.path; // Set the Cloudinary URL
    }
    const newCourt = new Court(courtData);
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

/**
 * AI gợi ý sân dựa trên prompt của người dùng
 */
export const suggestCourts = async (req: Request, res: Response) => {
    try {
        // Kiểm tra validation errors từ middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const { prompt, userLat, userLng, maxDistance, limit } = req.body;

        const result = await CourtService.suggestCourts({
            prompt: prompt.trim(),
            userLat: userLat ? parseFloat(userLat) : undefined,
            userLng: userLng ? parseFloat(userLng) : undefined,
            maxDistance: maxDistance ? parseFloat(maxDistance) : 10,
            limit: limit ? parseInt(limit) : 5,
        });

        res.status(200).json({
            message: "AI gợi ý sân thành công",
            data: result,
        });
    } catch (error: any) {
        console.error("Error in suggestCourts controller:", error);
        res.status(500).json({ 
            message: "Lỗi khi gợi ý sân",
            error: error.message 
        });
    }
};

/**
 * Tạo mô tả chi tiết cho sân bằng AI
 */
export const generateDescription = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ message: "Thiếu ID sân" });
        }

        const description = await CourtService.generateCourtDescription(id);

        // Cập nhật mô tả vào database
        await Court.findByIdAndUpdate(id, { description });

        res.status(200).json({
            message: "Tạo mô tả thành công",
            data: { description },
        });
    } catch (error: any) {
        console.error("Error in generateDescription controller:", error);
        res.status(500).json({ 
            message: "Lỗi khi tạo mô tả",
            error: error.message 
        });
    }
};

/**
 * So sánh nhiều sân bằng AI
 */
export const compareCourts = async (req: Request, res: Response) => {
    try {
        // Kiểm tra validation errors từ middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: errors.array(),
            });
        }

        const { courtIds } = req.body;

        const comparison = await CourtService.compareCourts(courtIds);

        res.status(200).json({
            message: "So sánh sân thành công",
            data: { comparison },
        });
    } catch (error: any) {
        console.error("Error in compareCourts controller:", error);
        res.status(500).json({ 
            message: "Lỗi khi so sánh sân",
            error: error.message 
        });
    }
};