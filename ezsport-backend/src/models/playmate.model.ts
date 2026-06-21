import mongoose, { Document, Schema } from "mongoose";

export interface IPlaymate extends Document {
  creator: mongoose.Types.ObjectId;
  sport: "Pickleball" | "Cầu lông" | "Bóng đá" | "Tennis";
  creatorLevel: "Mới chơi" | "Trung bình" | "Khá / Pro";
  title: string;
  description?: string;
  venueName: string;
  timeSlot: string;
  dateStr: string;
  slotsTotal: number;
  participants: mongoose.Types.ObjectId[];
  status: "open" | "full" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const playmateSchema = new Schema<IPlaymate>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sport: {
      type: String,
      enum: ["Pickleball", "Cầu lông", "Bóng đá", "Tennis"],
      required: true,
    },
    creatorLevel: {
      type: String,
      enum: ["Mới chơi", "Trung bình", "Khá / Pro"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    venueName: { type: String, required: true, trim: true },
    timeSlot: { type: String, required: true, trim: true },
    dateStr: { type: String, required: true, trim: true },
    slotsTotal: { type: Number, required: true, min: 2 },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["open", "full", "cancelled", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export const Playmate = mongoose.model<IPlaymate>("Playmate", playmateSchema);
