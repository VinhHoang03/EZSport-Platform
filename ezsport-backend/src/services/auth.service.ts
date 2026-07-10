import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model";
import PasswordResetToken from "../models/passwordResetToken.model";
import { UserRole, UserStatus } from "../enum/user.enum";
import { sendResetPasswordEmail } from "../utils/sendEmail";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface JwtUserPayload {
  id: string;
  role: string;
}

class AuthService {
  generateToken(payload: JwtUserPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
  }

  generateRefreshToken(payload: JwtUserPayload): string {
    return jwt.sign(payload, process.env.REFRESH_SECRET as string, {
      expiresIn: "7d",
    });
  }

  saveToken(res: Response, accessToken: string): void {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  saveRefreshToken(res: Response, refreshToken: string): void {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("No refresh token provided");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as JwtPayload;
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    const newAccessToken = this.generateToken({
      id: user.id.toString(),
      role: decoded.role,
    });
    const newRefreshToken = this.generateRefreshToken({
      id: user.id.toString(),
      role: decoded.role,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async register({
    username,
    email,
    password,
    fullName,
    phone,
    role,
  }: {
    username: string;
    email?: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
  }) {
    const existing = await User.findOne({ username });
    if (existing) throw new Error("Username đã tồn tại");

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      fullName,
      email,
      password: hashed,
      phone,
      role: role as any,
    });

    return {
      user: {
        _id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  }

  async login({ username, password }: { username: string; password: string }) {
    const user = await User.findOne({ username });
    if (!user || !user.password) throw new Error("Không tìm thấy tài khoản");

    if (user.status === UserStatus.BANNED) {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai mật khẩu");

    const accessToken = this.generateToken({
      id: user.id.toString(),
      role: user.role,
    });
    const refreshToken = this.generateRefreshToken({
      id: user.id.toString(),
      role: user.role,
    });

    return {
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        loyaltyPoints: user.loyaltyPoints || 0,
        venueIds: user.venueIds?.map((v: any) => v.toString()) || [],
        shopAddress: user.shopAddress || '',
        shopLat: user.shopLat,
        shopLng: user.shopLng,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(googleToken: string) {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Google payload invalid");

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      
      user = await User.create({
        username: email.split('@')[0],
        fullName: name || email.split('@')[0],
        email,
        password: '',
        avatar: picture,
        role: UserRole.PLAYER,
        status: UserStatus.ACTIVE,
      });
    }

    if (user.status === UserStatus.BANNED) {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    }

    const accessToken = this.generateToken({
      id: user.id.toString(),
      role: user.role,
    });
    const refreshToken = this.generateRefreshToken({
      id: user.id.toString(),
      role: user.role,
    });

    return {
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        loyaltyPoints: user.loyaltyPoints || 0,
        venueIds: user.venueIds?.map((v: any) => v.toString()) || [],
        shopAddress: user.shopAddress || '',
        shopLat: user.shopLat,
        shopLng: user.shopLng,
      },
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Không tìm thấy tài khoản với email này");

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour expiration
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5175"}/reset-password/${token}`;
    await sendResetPasswordEmail(email, resetUrl);
    return resetUrl;
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetTokenDoc = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetTokenDoc) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findById(resetTokenDoc.userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    resetTokenDoc.used = true;
    await resetTokenDoc.save();
  }

  async logout(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    return { message: "Logout success" };
  }
}

const AuthServiceInstance = new AuthService();
export default AuthServiceInstance;

// Named exports for controller compatibility
export const loginService = async (username: string, password: string) => {
  return await AuthServiceInstance.login({ username, password });
};

export const registerService = async (
  username: string,
  email: string | undefined,
  password: string,
  fullName: string,
  phone?: string,
  role?: string
) => {
  return await AuthServiceInstance.register({ username, email, password, fullName, phone, role });
};

export const forgotPasswordService = async (email: string) => {
  return await AuthServiceInstance.forgotPassword(email);
};

export const resetPasswordService = async (token: string, password: string) => {
  return await AuthServiceInstance.resetPassword(token, password);
};

export const googleLoginService = async (googleToken: string) => {
  return await AuthServiceInstance.googleLogin(googleToken);
};