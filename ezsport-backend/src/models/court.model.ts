import mongoose, { Schema, Document } from "mongoose";

export interface ICourt extends Document {
  name: string;
  description?: string;
  image: string;
  rating: number;
  location: string;
  price: string;
  lat: number;
  lng: number;
  emoji: string;
  sportType: string;
  isActive: boolean;
}

const CourtSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    location: { type: String, required: true },
    price: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    emoji: { type: String, required: true },
    sportType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICourt>("Court", CourtSchema);
