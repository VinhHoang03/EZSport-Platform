import { Router } from "express";
import {
  createProviderRequest,
  getProviderRequests,
  approveProviderRequest
} from "../controllers/providerRequest.controller";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

/**
 * CUSTOMER submit request
 */

router.post(
  "/",
  authMiddleware,
  requireRole("CUSTOMER"),
  createProviderRequest
);

/**
 * ADMIN manage provider requests
 */

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  getProviderRequests
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  approveProviderRequest
);

export default router;