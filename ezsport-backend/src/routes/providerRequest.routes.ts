/*
import { Router } from "express";
import {
  createProviderRequest,
  getProviderRequests,
  approveProviderRequest
} from "../controllers/providerRequest.controller";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("CUSTOMER"),
  createProviderRequest
);

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
*/
import { Router } from "express";
const router = Router();
export default router;