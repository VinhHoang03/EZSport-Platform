import mongoose, { Document, Schema } from "mongoose";
import { UserRole, UserStatus } from "../enum/user.enum"
export interface IUser extends Document {
  fullName: string;
  username: string;
  email?: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "owner" | "player";
  status: "active" | "inactive" | "banned";
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loyaltyPoints?: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankQrCode?: string;
}

export interface IUserDocument extends IUser, Document {}

  const userSchema = new Schema<IUserDocument>(
    {
      fullName: { type: String, required: true },
      username: { type: String, required: true, unique: true },
      email: { type: String, required: false, unique: true, sparse: true },
      password: { type: String },
      phone: { type: String },
      avatar: { type: String },
      role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.PLAYER,
      },
      status: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE,
      },
      lastLogin: { type: Date, default: null },
      loyaltyPoints: { type: Number, default: 0, min: 0 },
      bankName: { type: String, required: false },
      bankAccountName: { type: String, required: false },
      bankAccountNumber: { type: String, required: false },
      bankQrCode: { type: String, required: false },
    },
    { timestamps: true }
  );

export const User = mongoose.model<IUserDocument>("User", userSchema);
