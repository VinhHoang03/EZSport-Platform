import { Router } from "express";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getServiceHistory
} from "../controllers/address.controller";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

/**
 * CUSTOMER routes
 */

router.get(
  "/",
  authMiddleware,
  requireRole("CUSTOMER"),
  getUserAddresses
);

router.post(
  "/",
  authMiddleware,
  requireRole("CUSTOMER"),
  createAddress
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("CUSTOMER"),
  updateAddress
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("CUSTOMER"),
  deleteAddress
);

/**
 * service history
 */

router.get(
  "/service-history",
  authMiddleware,
  requireRole("CUSTOMER"),
  getServiceHistory
);

console.log("Address routes loaded");

export default router;