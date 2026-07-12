import mongoose, { Document, Schema } from "mongoose";

export type CoachRefundStatus = "PENDING" | "PROCESSING" | "REFUNDED" | "FAILED";

export interface ICoachRefund extends Document {
  bookingId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: CoachRefundStatus;
  adminNote?: string;
  transactionReference?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
}

const coachRefundSchema = new Schema<ICoachRefund>({
  bookingId: { type: Schema.Types.ObjectId, ref: "CoachBooking", required: true, unique: true, index: true },
  playerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  coachId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ["PENDING", "PROCESSING", "REFUNDED", "FAILED"], default: "PENDING", index: true },
  adminNote: { type: String, trim: true, maxlength: 1000 },
  transactionReference: { type: String, trim: true, maxlength: 200 },
  processedBy: { type: Schema.Types.ObjectId, ref: "User" },
  processedAt: Date,
}, { timestamps: true });

export default mongoose.model<ICoachRefund>("CoachRefund", coachRefundSchema);
