import { Request, Response } from "express";
import { loginService } from "../services/auth.service";
import { registerService } from "../services/auth.service";
import { registerSchema } from "../validators/auth.validator";
import {
  forgotPasswordService,
  resetPasswordService
} from "../services/auth.service";


export const login = async (req: Request, res: Response) => {
  try {

    const { email, password } = req.body;

    const result = await loginService(email, password);

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

export const register = async (req: Request, res: Response) => {
  try {

    const data = registerSchema.parse(req.body);

    const user = await registerService(
      data.email,
      data.password,
      data.fullName,
      data.phone
    );

    res.status(201).json({
      message: "Register success",
      user
    });

  } catch (error: any) {
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

    const resetUrl = await forgotPasswordService(email);

    res.json({
      message: "Reset password link generated",
      resetUrl
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
