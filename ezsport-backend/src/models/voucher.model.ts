import mongoose, { Document, Schema } from "mongoose";

export type VoucherDiscountType = "fixed" | "percent";

export interface IVoucher extends Document {
  code: string;
  type: VoucherDiscountType;
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  pointCost: number;
  quantity: number;
  usedCount: number;
  redeemedCount: number;
  target: string;
  expiresAt?: Date;
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ["fixed", "percent"], required: true },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    pointCost: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    redeemedCount: { type: Number, default: 0, min: 0 },
    target: { type: String, default: "all" },
    expiresAt: Date,
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IVoucher>("Voucher", voucherSchema);
