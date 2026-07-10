import mongoose, { Document, Schema } from "mongoose";

export type CoachReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface ICoachProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio?: string;
  sports: string[];
  specialties: string[];
  teachingModes: ("online" | "offline")[];
  area?: string;
  pricePerHour: number;
  sessionDurations: number[];
  isAcceptingBookings: boolean;
  reviewStatus: CoachReviewStatus;
  reviewNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  weeklyAvailability: { dayOfWeek: number; startTime: string; endTime: string }[];
  dateExceptions: { date: Date; isAvailable: boolean; startTime?: string; endTime?: string }[];
}

const timeSchema = new Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true, match: /^([0-1]?\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([0-1]?\d|2[0-3]):[0-5]\d$/ },
}, { _id: false });

const coachProfileSchema = new Schema<ICoachProfile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  bio: { type: String, trim: true, maxlength: 2000 },
  sports: { type: [String], default: [] },
  specialties: { type: [String], default: [] },
  teachingModes: { type: [String], enum: ["online", "offline"], default: [] },
  area: { type: String, trim: true },
  pricePerHour: { type: Number, min: 0, default: 0 },
  sessionDurations: { type: [Number], default: [60] },
  isAcceptingBookings: { type: Boolean, default: false },
  reviewStatus: { type: String, enum: ["PENDING_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"], default: "PENDING_REVIEW", index: true },
  reviewNote: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  weeklyAvailability: { type: [timeSchema], default: [] },
  dateExceptions: { type: [{
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, required: true },
    startTime: String,
    endTime: String,
  }], default: [] },
}, { timestamps: true });

coachProfileSchema.index({ reviewStatus: 1, isAcceptingBookings: 1, sports: 1 });

export default mongoose.model<ICoachProfile>("CoachProfile", coachProfileSchema);
