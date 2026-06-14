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

export const listAvailableVouchers = async (_req: Request, res: Response) => {
  const vouchers = await Voucher.find({ active: true }).sort({ pointCost: 1, createdAt: -1 });
  return res.json({
    data: vouchers.filter((v) => !isExpired(v.expiresAt) && v.redeemedCount < v.quantity),
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

    const existing = await UserVoucher.findOne({ userId, voucherId });
    if (existing) return res.status(400).json({ message: "Bạn đã đổi voucher này rồi" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
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
  if (voucher.pointCost > 0) {
    const owned = await UserVoucher.findOne({ userId, voucherId: voucher._id, status: "available" });
    if (!owned) return res.status(400).json({ message: "Bạn cần đổi voucher này bằng điểm trước khi sử dụng" });
  }

  const discount = calculateDiscount(voucher, orderValue);
  if (discount <= 0) {
    return res.status(400).json({ message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ` });
  }

  return res.json({ data: { voucher, discount } });
};
