import mongoose, { Schema, Document } from "mongoose";

export interface IAmenity {
  key: string;   // 'parking' | 'wifi' | 'shower' | 'lights' | 'water' | 'racket' | 'canteen' | 'shop'
  label: string; // 'Bãi đỗ xe'
  icon: string;  // material symbol name
  available: boolean;
}

export interface IVenue extends Document {
  name: string;
  description?: string;

  // Media
  image: string;          // main cover image
  images?: string[];      // gallery (up to 4 extra)

  // Location
  location: string;
  lat: number;
  lng: number;

  // Sport
  sportTypes: string[];   // ['badminton', 'pickleball'] — replaces single sportType
  emoji: string;

  // Pricing
  price: string;          // display string e.g. "150.000 VNĐ / Giờ"
  pricePerHour: number;   // numeric for calculation e.g. 150000

  // Hours
  openTime: string;       // '06:00'
  closeTime: string;      // '22:00'

  // Amenities
  amenities: IAmenity[];

  // Contact
  phone?: string;
  email?: string;

  // Stats
  rating: number;
  reviewsCount: number;

  // Status
  isActive: boolean;
  isVerified: boolean;
}

const AmenitySchema = new Schema<IAmenity>(
  {
    key:       { type: String, required: true },
    label:     { type: String, required: true },
    icon:      { type: String, required: true },
    available: { type: Boolean, default: false },
  },
  { _id: false }
);

const DEFAULT_AMENITIES: IAmenity[] = [
  { key: 'parking',      label: 'Bãi đỗ xe',        icon: 'local_parking',  available: false },
  { key: 'shower',       label: 'Tủ đồ & Phòng tắm', icon: 'shower',         available: false },
  { key: 'wifi',         label: 'Wi-Fi miễn phí',    icon: 'wifi',           available: false },
  { key: 'lights',       label: 'Hệ thống đèn',      icon: 'emoji_objects',  available: false },
  { key: 'water',        label: 'Nước uống',          icon: 'water_drop',     available: false },
  { key: 'racket',       label: 'Cho thuê vợt',       icon: 'sports_tennis',  available: false },
  { key: 'canteen',      label: 'Căng tin',           icon: 'local_cafe',     available: false },
  { key: 'shop',         label: 'Cửa hàng đồ tập',   icon: 'shopping_bag',   available: false },
];

const VenueSchema: Schema = new Schema<IVenue>(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, default: '' },

    // Media
    image:        { type: String, default: 'https://placehold.co/800x450?text=EZSport+Venue' },
    images:       { type: [String], default: [] },

    // Location
    location:     { type: String, required: true },
    lat:          { type: Number, required: true },
    lng:          { type: Number, required: true },

    // Sport
    sportTypes:   { type: [String], required: true },
    emoji:        { type: String, default: '🏟️' },

    // Pricing
    price:        { type: String, required: true },
    pricePerHour: { type: Number, required: true, min: 0 },

    // Hours
    openTime:     { type: String, default: '06:00' },
    closeTime:    { type: String, default: '22:00' },

    // Amenities
    amenities:    { type: [AmenitySchema], default: DEFAULT_AMENITIES },

    // Contact
    phone:        { type: String },
    email:        { type: String },

    // Stats
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },

    // Status
    isActive:     { type: Boolean, default: true },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text search index
VenueSchema.index({ name: 'text', location: 'text', description: 'text' });
// Geo query index
VenueSchema.index({ lat: 1, lng: 1 });
// Filter indexes
VenueSchema.index({ sportTypes: 1, isActive: 1 });

export default mongoose.model<IVenue>("Venue", VenueSchema);
