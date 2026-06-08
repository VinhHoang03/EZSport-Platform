import mongoose, { Document, Schema } from "mongoose";

export type UserVoucherStatus = "available" | "used";

export interface IUserVoucher extends Document {
  userId: mongoose.Types.ObjectId;
  voucherId: mongoose.Types.ObjectId;
  code: string;
  status: UserVoucherStatus;
  usedBookingId?: mongoose.Types.ObjectId;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userVoucherSchema = new Schema<IUserVoucher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    voucherId: { type: Schema.Types.ObjectId, ref: "Voucher", required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    status: { type: String, enum: ["available", "used"], default: "available", index: true },
    usedBookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    usedAt: Date,
  },
  { timestamps: true }
);

userVoucherSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

export default mongoose.model<IUserVoucher>("UserVoucher", userVoucherSchema);
