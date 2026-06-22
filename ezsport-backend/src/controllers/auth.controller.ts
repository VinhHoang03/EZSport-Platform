import { Request, Response } from "express";
import { loginService } from "../services/auth.service";
import { registerService } from "../services/auth.service";
import { googleLoginService } from "../services/auth.service";
import { registerSchema } from "../validators/auth.validator";
import {
  forgotPasswordService,
  resetPasswordService
} from "../services/auth.service";


export const login = async (req: Request, res: Response) => {
  try {

    const { username, password } = req.body;

    const result = await loginService(username, password);

    res.status(200).json({
      message: "Login success",
      data: result
    });

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) throw new Error("Google credential is required");

    const result = await googleLoginService(credential);

    res.status(200).json({
      message: "Google login success",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {

    const data = registerSchema.parse(req.body);

    const user = await registerService(
      data.username,
      data.email,
      data.password,
      data.fullName,
      data.phone,
      data.role
    );

    res.status(201).json({
      message: "Register success",
      user
    });

  } catch (error: any) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({
        message: error.issues?.[0]?.message || "Dữ liệu đăng ký không hợp lệ",
        errors: error.issues,
      });
    }
    if (error.code === 11000 || error.message?.includes("11000") || error.message?.includes("duplicate key")) {
      let field = "Dữ liệu";
      const errMsg = error.message || "";
      const errStr = JSON.stringify(error);
      if (errMsg.includes("email") || errStr.includes("email")) {
        field = "Email";
      } else if (errMsg.includes("username") || errStr.includes("username")) {
        field = "Tên đăng nhập";
      }
      return res.status(400).json({
        message: `${field} đã được sử dụng. Vui lòng thử lại.`
      });
    }
    res.status(400).json({
      message: error.message
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  return res.json({
    message: "Logout successful"
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    res.json({
      message: "Reset password link sent to your email",
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await resetPasswordService(token as string, password);

    res.json({
      message: "Password reset successful"
    });

  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};
