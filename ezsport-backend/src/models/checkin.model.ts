import mongoose, { Document, Schema } from "mongoose";

export interface ICheckIn extends Document {
  user: mongoose.Types.ObjectId;
  court: mongoose.Types.ObjectId;
  pointsEarned: number;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    court: {
      type: Schema.Types.ObjectId,
      ref: "Court",
      required: true
    },
    pointsEarned: {
      type: Number,
      required: true
    },
    location: {
      lat: Number,
      lng: Number
    }
  },
  { timestamps: true }
);

// Tránh check-in nhiều lần tại cùng 1 sân trong 1 ngày
CheckInSchema.index({ user: 1, court: 1, createdAt: -1 });

export default mongoose.model<ICheckIn>("CheckIn", CheckInSchema);
