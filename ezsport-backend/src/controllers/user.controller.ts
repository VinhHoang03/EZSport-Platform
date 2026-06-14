import { Request, Response } from "express";
import { User } from "../models/user.model";

// GET /api/users/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Get profile success", data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/me
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { fullName, phone, email } = req.body;
    const updateData: any = {};

    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    // Handle avatar upload (Cloudinary via multer)
    if (req.file?.path) {
      updateData.avatar = req.file.path;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
