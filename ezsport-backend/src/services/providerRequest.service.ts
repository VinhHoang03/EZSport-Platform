import { ProviderRequest } from "../models/providerRequest.model";
import { Provider } from "../models/provider.model";
import { Types } from "mongoose";
import { ProviderRequestStatus } from "../models/providerRequest.model";


export const createProviderRequest = async (userId: string, data: any) => {
  const existing = await ProviderRequest.findOne({
    userId,
    status: "PENDING",
  });

  if (existing) {
    throw new Error("Provider request already pending");
  }

  const request = await ProviderRequest.create({
    ...data,
    userId,
  });

  return request;
};

export const getProviderRequests = async (status?: string) => {
  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  return ProviderRequest.find(filter)
    .populate("userId", "fullName email phone")
    .sort({ createdAt: -1 });
};

export const approveProviderRequest = async (
  requestId: string,
  adminId: string
) => {
  const request = await ProviderRequest.findById(requestId);

  if (!request) {
    throw new Error("Provider request not found");
  }

  request.status = ProviderRequestStatus.APPROVED;
  request.reviewedBy = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();

  await request.save();

  const provider = await Provider.create({
    userId: request.userId,
    description: request.description,
    experienceYears: request.experienceYears,
    serviceCategories: request.serviceCategories,
    workingAreas: request.workingAreas,
    verified: true,
  });

  return { request, provider };
};

export const rejectProviderRequest = async (
  requestId: string,
  adminId: string
) => {
  const request = await ProviderRequest.findById(requestId);

  if (!request) {
    throw new Error("Provider request not found");
  }

  request.status = ProviderRequestStatus.REJECTED;
  request.reviewedBy = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();

  await request.save();

  return request;
};