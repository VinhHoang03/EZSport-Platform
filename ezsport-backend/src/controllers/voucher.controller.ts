import { Request, Response } from "express";
import Voucher from "../models/voucher.model";
import UserVoucher from "../models/userVoucher.model";
import { User } from "../models/user.model";

const isExpired = (expiresAt?: Date | null) => !!expiresAt && expiresAt.getTime() < Date.now();

const calculateDiscount = (voucher: any, orderValue: number) => {
  if (orderValue < (voucher.minOrderValue || 0)) return 0;
  const raw = voucher.type === "percent" ? Math.floor(orderValue * (voucher.value / 100)) : voucher.value;
  return Math.min(raw, voucher.maxDiscount || raw, orderValue);
};

export const listAdminVouchers = async (_req: Request, res: Response) => {
  const vouchers = await Voucher.find().sort({ createdAt: -1 });
  return res.json({ data: vouchers });
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const {
      code,
      type,
      value,
      maxDiscount,
      minOrderValue = 0,
      pointCost = 0,
      quantity,
      target = "all",
      expiresAt,
      active = true,
    } = req.body;

    const voucher = await Voucher.create({
      code: String(code || "").toUpperCase(),
      type,
      value,
      maxDiscount,
      minOrderValue,
      pointCost,
      quantity,
      target,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      active,
      createdBy: req.user?.id || req.id,
    });

    return res.status(201).json({ message: "Voucher created", data: voucher });
  } catch (err: any) {
    if (err.code === 11000 || err.message?.includes("11000") || err.message?.includes("duplicate key")) {
      return res.status(400).json({ message: "Mã voucher này đã tồn tại trong hệ thống. Vui lòng nhập mã khác." });
    }
    return res.status(400).json({ message: err?.message || "Cannot create voucher" });
  }
};

export const deleteVoucher = async (req: Request, res: Response) => {
  await Voucher.findByIdAndDelete(req.params.id);
  return res.json({ message: "Voucher deleted" });
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const {
      value,
      maxDiscount,
      minOrderValue,
      pointCost,
      quantity,
      target,
      expiresAt,
      active,
    } = req.body;

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      {
        value,
        maxDiscount,
        minOrderValue,
        pointCost,
        quantity,
        target,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        active,
      },
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    return res.json({ message: "Voucher updated", data: voucher });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Cannot update voucher" });
  }
};

export const listAvailableVouchers = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.id;
  const user = await User.findById(userId);

  const vouchers = await Voucher.find({ active: true }).sort({ pointCost: 1, createdAt: -1 });
  const filtered = vouchers.filter((v) => {
    if (isExpired(v.expiresAt)) return false;
    if (v.redeemedCount >= v.quantity) return false;

    // Check target group eligibility
    if (v.target === "Người dùng mới") {
      if (!user) return false;
      const daysSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRegistration > 7) {
        return false;
      }
    }
    return true;
  });

  return res.json({
    data: filtered,
  });
};

export const listMyVouchers = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.id;
  const items = await UserVoucher.find({ userId, status: "available" })
    .populate("voucherId")
    .sort({ createdAt: -1 });
  return res.json({ data: items });
};

export const redeemVoucher = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.id;
    const { voucherId } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.active || isExpired(voucher.expiresAt)) {
      return res.status(400).json({ message: "Voucher không khả dụng" });
    }
    if (voucher.redeemedCount >= voucher.quantity) {
      return res.status(400).json({ message: "Voucher đã hết lượt đổi" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check target group eligibility
    if (voucher.target === "Người dùng mới") {
      const daysSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRegistration > 7) {
        return res.status(400).json({ message: "Voucher này chỉ dành cho người dùng mới (đăng ký trong vòng 7 ngày)" });
      }
    }

    const existing = await UserVoucher.findOne({ userId, voucherId });
    if (existing) return res.status(400).json({ message: "Bạn đã đổi voucher này rồi" });

    if ((user.loyaltyPoints || 0) < voucher.pointCost) {
      return res.status(400).json({ message: "Bạn không đủ điểm để đổi voucher này" });
    }

    user.loyaltyPoints = (user.loyaltyPoints || 0) - voucher.pointCost;
    await user.save();

    voucher.redeemedCount += 1;
    await voucher.save();

    const userVoucher = await UserVoucher.create({ userId, voucherId, code: voucher.code });
    return res.status(201).json({
      message: "Redeemed voucher",
      data: userVoucher,
      totalPoints: user.loyaltyPoints,
    });
  } catch (err: any) {
    if (err.code === 11000 || err.message?.includes("11000") || err.message?.includes("duplicate key")) {
      return res.status(400).json({ message: "Bạn đã đổi voucher này rồi" });
    }
    return res.status(400).json({ message: err?.message || "Cannot redeem voucher" });
  }
};

export const validateVoucher = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.id;
  const code = String(req.body.code || "").toUpperCase().trim();
  const orderValue = Number(req.body.orderValue || 0);

  const voucher = await Voucher.findOne({ code, active: true });
  if (!voucher || isExpired(voucher.expiresAt)) {
    return res.status(404).json({ message: "Voucher không tồn tại hoặc đã hết hạn" });
  }
  if (voucher.usedCount >= voucher.quantity) {
    return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  // Check target group eligibility
  if (voucher.target === "Người dùng mới") {
    const daysSinceRegistration = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration > 7) {
      return res.status(400).json({ message: "Voucher này chỉ dành cho người dùng mới (đăng ký trong vòng 7 ngày)" });
    }
  }

  if (voucher.pointCost > 0) {
    const owned = await UserVoucher.findOne({ userId, voucherId: voucher._id, status: "available" });
    if (!owned) return res.status(400).json({ message: "Bạn cần đổi voucher này bằng điểm trước khi sử dụng" });
  } else {
    const hasUsed = await UserVoucher.findOne({ userId, voucherId: voucher._id });
    if (hasUsed) return res.status(400).json({ message: "Bạn đã sử dụng voucher này rồi" });
  }

  const discount = calculateDiscount(voucher, orderValue);
  if (discount <= 0) {
    return res.status(400).json({ message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ` });
  }

  return res.json({ data: { voucher, discount } });
};
