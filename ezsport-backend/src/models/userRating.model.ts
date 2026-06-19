import mongoose, { Document, Schema } from "mongoose";

export interface IUserRating extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;         // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserRatingSchema = new Schema<IUserRating>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per reviewer per reviewee
UserRatingSchema.index({ reviewer: 1, reviewee: 1 }, { unique: true });

export const UserRating = mongoose.model<IUserRating>("UserRating", UserRatingSchema);
