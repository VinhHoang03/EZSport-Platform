import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "BANNED";

  resetPasswordTokenHash?: string;
  resetPasswordExpire?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    fullName: {
      type: String,
      required: true
    },

    phone: String,
    avatar: String,

    role: {
      type: String,
      enum: ["CUSTOMER", "PROVIDER", "ADMIN"],
      default: "CUSTOMER"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BANNED"],
      default: "ACTIVE"
    },

    resetPasswordTokenHash: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);