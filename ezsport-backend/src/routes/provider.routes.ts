/*
import { Router } from "express";
import { updateProviderStatus } from "../controllers/provider.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.patch(
  "/status",
  authMiddleware,
  requireRole("PROVIDER"),
  updateProviderStatus
);

export default router;
*/
import { Router } from "express";
const router = Router();
export default router;