import { Response } from "express";
import * as providerRequestService from "../services/providerRequest.service";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Customer create provider request
 */
export const createProviderRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    const request = await providerRequestService.createProviderRequest(
      userId as string,
      req.body
    );

    return res.json({
      success: true,
      data: request,
      message: "Provider request submitted",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin get provider requests
 */
export const getProviderRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.query;

    const requests = await providerRequestService.getProviderRequests(
      status as string
    );

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin approve provider request
 */
export const approveProviderRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const adminId = req.user?.userId;
    const { id } = req.params;

    const result = await providerRequestService.approveProviderRequest(
      id as string,
      adminId as string
    );

    return res.json({
      success: true,
      data: result,
      message: "Provider request approved",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};