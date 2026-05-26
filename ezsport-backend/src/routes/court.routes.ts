import express from "express";
import {
  getCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
} from "../controllers/court.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/", getCourts);
router.get("/:id", getCourtById);
router.post("/", verifyToken, authorizeRoles("owner"), upload.array("images", 5), createCourt);
router.put("/:id", verifyToken, authorizeRoles("owner"), upload.array("images", 5), updateCourt);
router.delete("/:id", verifyToken, authorizeRoles("owner"), deleteCourt);

export default router;
