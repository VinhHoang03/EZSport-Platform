import mongoose, { Document, Schema } from "mongoose";
import { UserRole, UserStatus } from "../enum/user.enum"
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "owner" | "player";
  status: "active" | "inactive" | "banned";
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface IUserDocument extends IUser, Document {}

  const userSchema = new Schema<IUserDocument>(
    {
      fullName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
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
    },
    { timestamps: true }
  );

export const User = mongoose.model<IUserDocument>("User", userSchema);
