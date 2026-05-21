import express from "express";
import { getCourts, createCourt, deleteCourt, checkIn } from "../controllers/court.controller";
import { verifyToken } from "../middlewares/auth.middleware";

import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/", getCourts);
router.post("/", upload.single("image"), createCourt);
router.delete("/:id", deleteCourt);
router.post("/:id/check-in", verifyToken as any, checkIn as any);

export default router;
