import express from "express";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware";
import {
  createVoucher,
  deleteVoucher,
  updateVoucher,
  listAdminVouchers,
  listAvailableVouchers,
  listMyVouchers,
  redeemVoucher,
  validateVoucher,
} from "../controllers/voucher.controller";

const router = express.Router();

router.use(verifyToken);

router.get("/", listAvailableVouchers);
router.get("/me", listMyVouchers);
router.post("/redeem", redeemVoucher);
router.post("/validate", validateVoucher);

router.get("/admin", authorizeRoles("admin"), listAdminVouchers);
router.post("/admin", authorizeRoles("admin"), createVoucher);
router.put("/admin/:id", authorizeRoles("admin"), updateVoucher);
router.delete("/admin/:id", authorizeRoles("admin"), deleteVoucher);

export default router;
