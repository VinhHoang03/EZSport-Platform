import { Response } from "express";
import * as providerService from "../services/provider.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const updateProviderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { activeStatus } = req.body;

    const provider = await providerService.updateProviderStatus(
      userId as string,
      activeStatus
    );

    return res.json({
      success: true,
      data: provider,
      message: "Provider status updated",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};