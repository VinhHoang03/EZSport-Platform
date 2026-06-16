import express from "express";
import {
  getOwnerStats,
  getRevenueChart,
  getTopCourts,
  getOwnerTransactions,
} from "../controllers/analytics.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập và role owner
router.get("/owner/stats", verifyToken as any, authorizeRoles("owner"), getOwnerStats as any);
router.get("/owner/revenue-chart", verifyToken as any, authorizeRoles("owner"), getRevenueChart as any);
router.get("/owner/top-courts", verifyToken as any, authorizeRoles("owner"), getTopCourts as any);
router.get("/owner/transactions", verifyToken as any, authorizeRoles("owner"), getOwnerTransactions as any);

export default router;
