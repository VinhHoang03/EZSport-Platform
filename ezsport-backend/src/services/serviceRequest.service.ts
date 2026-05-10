import ServiceRequest, { IServiceRequest, RequestStatus } from "../models/serviceRequest.model";
import mongoose from "mongoose";




export const getRequestByCustomer = async (
    customerId: string, 
    status?: RequestStatus
): Promise<IServiceRequest[]> => {
    const filter: any = { customerId: new mongoose.Types.ObjectId(customerId) };
    if (status) {
        filter.status = status;
    }
    return await ServiceRequest.find(filter)
        .populate("serviceId", "name price")
        .populate("providerId", "fullName phone")
        .sort({ createdAt: -1 });
};

export const getRequestByDetail = async (
    requestId: string,
    customerId: string
): Promise<IServiceRequest> => {
    const request = await ServiceRequest.findById(requestId)
        if (!request) {
            throw new Error("Service request not found");
        }
        if (request.customerId.toString() !== customerId) {
            throw new Error("Access denied");
        }
        return request;
};