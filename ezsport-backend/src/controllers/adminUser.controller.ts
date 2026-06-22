import { Request, Response } from "express";
import { User } from "../models/user.model";
import { UserStatus } from "../enum/user.enum";

/**
 * Lấy danh sách toàn bộ người dùng (có thể lọc theo role, status)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cập nhật trạng thái của người dùng (duyệt chủ sân, khóa tài khoản, v.v.)
 */
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      message: "Cập nhật trạng thái người dùng thành công",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xóa người dùng khỏi hệ thống
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      message: "Xóa người dùng thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};