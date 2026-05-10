import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getMyRequests } from '../controllers/serviceRequest.controller';
const router = express.Router();

router.get('/my-requests', authMiddleware, getMyRequests);

export default router;  
