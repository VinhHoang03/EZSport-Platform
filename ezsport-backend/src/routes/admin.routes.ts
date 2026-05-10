import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from "../controllers/adminUser.controller";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";

const router = Router();

/**
 * ADMIN routes
 */

router.get(
  "/users",
  authMiddleware,
  requireRole("ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  requireRole("ADMIN"),
  getUserById
);

router.patch(
  "/users/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateUserStatus
);

router.delete(
  "/users/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteUser
);

export default router;