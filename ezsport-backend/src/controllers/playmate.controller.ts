import { Request, Response } from "express";
import { playmateService } from "../services/playmate.service";
import { createPlaymateSchema } from "../validators/playmate.validator";

export const getPlaymates = async (req: Request, res: Response) => {
  try {
    const { sport, level, search } = req.query;
    
    const playmates = await playmateService.getPlaymates({
      sport: sport as string,
      level: level as string,
      search: search as string,
    });

    res.status(200).json({
      message: "Lấy danh sách tin tìm bạn thành công",
      data: playmates,
    });
  } catch (error: any) {
    console.error("Error in getPlaymates:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const createPlaymate = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = createPlaymateSchema.parse(req.body);

    const playmate = await playmateService.createPlaymate(validatedData, creatorId);

    res.status(201).json({
      message: "Đăng tin tìm bạn thành công",
      data: playmate,
    });
  } catch (error: any) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({
        message: error.issues?.[0]?.message || "Dữ liệu đầu vào không hợp lệ",
        errors: error.issues,
      });
    }
    console.error("Error in createPlaymate:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const joinPlaymate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playmateId = req.params.id as string;
    const playmate = await playmateService.joinPlaymate(playmateId, userId);

    res.status(200).json({
      message: "Tham gia thành công",
      data: playmate,
    });
  } catch (error: any) {
    console.error("Error in joinPlaymate:", error);
    res.status(400).json({ message: error.message });
  }
};

export const leavePlaymate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playmateId = req.params.id as string;
    const playmate = await playmateService.leavePlaymate(playmateId, userId);

    res.status(200).json({
      message: "Rời nhóm thành công",
      data: playmate,
    });
  } catch (error: any) {
    console.error("Error in leavePlaymate:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deletePlaymate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playmateId = req.params.id as string;
    await playmateService.deletePlaymate(playmateId, userId);

    res.status(200).json({
      message: "Xóa tin tìm bạn thành công",
    });
  } catch (error: any) {
    console.error("Error in deletePlaymate:", error);
    res.status(400).json({ message: error.message });
  }
};
