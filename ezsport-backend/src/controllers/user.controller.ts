import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { updateProfileService } from "../services/user.service";

export const getProfile = async (req: AuthRequest, res: Response) => {
  return res.json({
    message: "User profile",
    user: req.user
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await updateProfileService(userId!, req.body);

    res.json({
      message: "Profile updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: "Update profile failed"
    });
  }
};