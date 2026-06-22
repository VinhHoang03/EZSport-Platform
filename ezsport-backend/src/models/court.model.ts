import mongoose, { Document, Schema } from "mongoose";
import { IAmenity } from "./venue.model";

export interface ICourt extends Document {
  venue: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  images?: string[];
  sportTypes: string[];
  courtType?: 'indoor' | 'outdoor';
  emoji: string;
  pricePerHour: number;
  pricingRules?: {
    label?: string;
    startTime: string;
    endTime: string;
    price: number;
    isActive: boolean;
  }[];
  status: 'available' | 'maintenance' | 'inactive';
  isActive: boolean;
}

const CourtSchema: Schema = new Schema<ICourt>(
  {
    venue: { type: Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    sportTypes: { type: [String], required: true, enum: ['badminton', 'pickleball'] },
    courtType: { type: String, enum: ['indoor', 'outdoor'] },
    emoji: { type: String, default: '🏟️' },
    pricePerHour: { type: Number, required: true, min: 0 },
    pricingRules: {
      type: [
        {
          label: { type: String, default: "" },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
          price: { type: Number, required: true, min: 0 },
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    status: { type: String, enum: ['available', 'maintenance', 'inactive'], default: 'available', },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourtSchema.index({ name: 'text', description: 'text' });
CourtSchema.index({ venue: 1, sportTypes: 1, isActive: 1 });

export default mongoose.model<ICourt>("Court", CourtSchema);
