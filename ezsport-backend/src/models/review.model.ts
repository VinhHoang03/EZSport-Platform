import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  venueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  rating: number;         // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
    userId:  { type: Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per user per venue
ReviewSchema.index({ venueId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);
