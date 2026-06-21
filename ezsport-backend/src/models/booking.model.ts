import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  bookingDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in hours
  sport: string;
  basePrice: number;
  serviceFee?: number;
  discount?: number;
  pointsUsed?: number;
  voucherCode?: string;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod?: string;
  payosOrderCode?: number;
  bookerName: string;
  bookerPhone: string;
  bookerEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  comboId?: mongoose.Types.ObjectId;
  comboType?: 'week' | 'month';
  deletedByUser?: boolean;
}

const bookingSchema = new Schema<IBooking>(
  {
    deletedByUser: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courtId: {
      type: Schema.Types.ObjectId,
      ref: "Court",
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    duration: {
      type: Number,
      required: true,
      min: 0.5,
      max: 24,
    },
    sport: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pointsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    voucherCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "payos"],
    },
    payosOrderCode: {
      type: Number,
      unique: true,
      sparse: true,
    },
    bookerName: {
      type: String,
      required: true,
    },
    bookerPhone: {
      type: String,
      required: true,
    },
    bookerEmail: String,
    notes: String,
    comboId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    comboType: {
      type: String,
      enum: ["week", "month"],
    },
  },
  { timestamps: true }
);

// Compound index for finding bookings by user and date
bookingSchema.index({ userId: 1, bookingDate: 1 });

// Compound index for finding available courts
bookingSchema.index({ courtId: 1, bookingDate: 1, status: 1 });

export default mongoose.model<IBooking>("Booking", bookingSchema);
