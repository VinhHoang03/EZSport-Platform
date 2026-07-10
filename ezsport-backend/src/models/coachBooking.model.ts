import mongoose, { Document, Schema } from "mongoose";

export type CoachBookingStatus = "PENDING_PAYMENT" | "PENDING_COACH_CONFIRMATION" | "CONFIRMED" | "COMPLETED" | "REJECTED" | "CANCELLED_BY_PLAYER" | "CANCELLED_BY_COACH" | "EXPIRED" | "NO_SHOW";
export type CoachPaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export interface ICoachBooking extends Document {
  playerId: mongoose.Types.ObjectId;
  coachProfileId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  teachingMode: "online" | "offline";
  location?: string;
  notes?: string;
  sport: string;
  hourlyRate: number;
  totalPrice: number;
  status: CoachBookingStatus;
  paymentStatus: CoachPaymentStatus;
  paymentMethod: "payos";
  payosOrderCode?: number;
  rejectionReason?: string;
  cancelledReason?: string;
  completedAt?: Date;
}

const coachBookingSchema = new Schema<ICoachBooking>({
  playerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  coachProfileId: { type: Schema.Types.ObjectId, ref: "CoachProfile", required: true, index: true },
  coachId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, min: 30, max: 480 },
  teachingMode: { type: String, enum: ["online", "offline"], required: true },
  location: { type: String, trim: true, maxlength: 500 },
  notes: { type: String, trim: true, maxlength: 2000 },
  sport: { type: String, required: true, trim: true },
  hourlyRate: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["PENDING_PAYMENT", "PENDING_COACH_CONFIRMATION", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED_BY_PLAYER", "CANCELLED_BY_COACH", "EXPIRED", "NO_SHOW"], default: "PENDING_PAYMENT", index: true },
  paymentStatus: { type: String, enum: ["UNPAID", "PAID", "REFUNDED", "FAILED"], default: "UNPAID" },
  paymentMethod: { type: String, enum: ["payos"], default: "payos" },
  payosOrderCode: { type: Number, unique: true, sparse: true },
  rejectionReason: String,
  cancelledReason: String,
  completedAt: Date,
}, { timestamps: true });

coachBookingSchema.index({ coachId: 1, startAt: 1, endAt: 1, status: 1 });

export default mongoose.model<ICoachBooking>("CoachBooking", coachBookingSchema);
