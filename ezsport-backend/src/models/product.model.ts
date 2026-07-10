import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  venueId: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  description?: string;
  price: number; // Tiêu chuẩn (giá bán hoặc thuê lẻ)
  priceWithCourt?: number; // Ưu đãi khi đặt kèm sân (áp dụng cho rent)
  stock: number;
  image?: string;
  isActive: boolean;
  type: 'sell' | 'rent';
  chargeType?: 'per_booking' | 'per_hour';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Khác", trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    priceWithCourt: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    type: { type: String, enum: ['sell', 'rent'], required: true, default: 'sell' },
    chargeType: { type: String, enum: ['per_booking', 'per_hour'], default: 'per_booking' }
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ venueId: 1, isActive: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);
