import express from "express";
import { 
    getCourts, 
    getCourtById,
    createCourt, 
    updateCourt, 
    deleteCourt, 
    checkIn } from "../controllers/court.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";

import upload from "../middlewares/upload.middleware";

const router = express.Router();


router.get("/", getCourts);
router.get("/:id", getCourtById);
router.post("/", verifyToken, authorizeRoles("owner"), upload.single("image"), createCourt);
router.put("/:id", verifyToken, authorizeRoles("owner"), upload.single("image"), updateCourt);
router.delete("/:id", verifyToken, authorizeRoles("owner"), deleteCourt);

router.post("/:id/check-in", verifyToken as any, checkIn as any);

export default router;
