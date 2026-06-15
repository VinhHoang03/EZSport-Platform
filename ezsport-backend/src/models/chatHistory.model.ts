import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  recommendations?: Array<{
    _id: string;
    venueId?: string;
    name: string;
    location: string;
    price: string;
    rating: number;
    sportType: string;
    emoji: string;
    image: string;
    lat: number;
    lng: number;
    distance?: number;
  }>;
  parsedSlot?: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
}

export interface IChatHistory extends Document {
  user: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    recommendations: [
      {
        _id: { type: String },
        venueId: { type: String },
        name: { type: String },
        location: { type: String },
        price: { type: String },
        rating: { type: Number },
        sportType: { type: String },
        emoji: { type: String },
        image: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        distance: { type: Number },
      },
    ],
    parsedSlot: {
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      duration: { type: Number },
    },
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
