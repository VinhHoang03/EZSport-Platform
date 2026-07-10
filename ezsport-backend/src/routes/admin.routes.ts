import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";
import {
  getUsers,
  updateUserStatus,
  deleteUser,
} from "../controllers/adminUser.controller";
import coachController from "../controllers/coach.controller";

const router = Router();

// GET /api/admin/users - Lấy danh sách người dùng
router.get(
  "/users",
  verifyToken as any,
  authorizeRoles("admin") as any,
  getUsers as any
);

// PATCH /api/admin/users/:id/status - Cập nhật trạng thái người dùng (duyệt/khóa)
router.patch(
  "/users/:id/status",
  verifyToken as any,
  authorizeRoles("admin") as any,
  updateUserStatus as any
);

// DELETE /api/admin/users/:id - Xóa người dùng khỏi hệ thống
router.delete(
  "/users/:id",
  verifyToken as any,
  authorizeRoles("admin") as any,
  deleteUser as any
);

router.get("/coaches", verifyToken as any, authorizeRoles("admin") as any, coachController.adminList.bind(coachController));
router.patch("/coaches/:id/review", verifyToken as any, authorizeRoles("admin") as any, coachController.adminReview.bind(coachController));

export default router;
