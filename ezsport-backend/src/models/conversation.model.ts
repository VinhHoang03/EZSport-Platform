import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  senderRole: "player" | "owner";
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface IConversation extends Document {
  participants: {
    player: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
  };
  venue?: mongoose.Types.ObjectId; // Optional: liên kết với venue cụ thể
  messages: IMessage[];
  lastMessage?: {
    text: string;
    timestamp: Date;
    sender: mongoose.Types.ObjectId;
  };
  unreadCount: {
    player: number;
    owner: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["player", "owner"], required: true },
    text: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: {
      player: { type: Schema.Types.ObjectId, ref: "User", required: true },
      owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    venue: { type: Schema.Types.ObjectId, ref: "Venue" },
    messages: { type: [MessageSchema], default: [] },
    lastMessage: {
      text: { type: String },
      timestamp: { type: Date },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
    },
    unreadCount: {
      player: { type: Number, default: 0 },
      owner: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh conversation giữa 2 người
ConversationSchema.index({ "participants.player": 1, "participants.owner": 1 });
ConversationSchema.index({ "lastMessage.timestamp": -1 });

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
