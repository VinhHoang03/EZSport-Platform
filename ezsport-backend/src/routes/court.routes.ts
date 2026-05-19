import express from "express";
import { getCourts, createCourt, deleteCourt, checkIn } from "../controllers/court.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", getCourts);
router.post("/", createCourt);
router.delete("/:id", deleteCourt);
router.post("/:id/check-in", authMiddleware as any, checkIn as any);

export default router;
