import User from "../models/user.model";
import { comparePassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";
import { hashPassword } from "../utils/password.util";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { generateResetToken } from "../utils/resetToken.ulti";

export const loginService = async (email: string, password: string) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BANNED") {
    throw new Error("Account is banned");
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = generateToken({
    userId: user._id,
    role: user.role
  });

  return {
    token,
    user
  };
};

export const registerService = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
) => {

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash,
    fullName,
    phone
  });

  return user;
};


export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const { token, tokenHash } = generateResetToken();

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl = `http://localhost:5000/auth/reset-password/${token}`;

  return resetUrl;
};

export const resetPasswordService = async (
  token: string,
  password: string
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  user.passwordHash = passwordHash;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
};