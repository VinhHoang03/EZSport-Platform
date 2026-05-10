import { Request, Response } from 'express';
import * as serviceRequestService from "../services/serviceRequest.service";

export const getMyRequests = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { status } = req.query;
        const requests = await serviceRequestService.getRequestByCustomer(
            req.user!.id, 
            status as any
        );
        res.json(requests);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};