import express from "express";
import { 
    getVenues, 
    getMyVenues,
    getVenueById,
    createVenue, 
    updateVenue, 
    deleteVenue, 
    checkIn } from "../controllers/venue.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";

import upload from "../middlewares/upload.middleware";

const router = express.Router();


router.get("/", getVenues);
router.get("/owner/me", verifyToken, authorizeRoles("owner"), getMyVenues);
router.get("/:id", getVenueById);
router.post("/", verifyToken, authorizeRoles("owner"), upload.single("image"), createVenue);
router.put("/:id", verifyToken, authorizeRoles("owner", "admin"), upload.single("image"), updateVenue);
router.delete("/:id", verifyToken, authorizeRoles("owner"), deleteVenue);

router.post("/:id/check-in", verifyToken as any, checkIn as any);

export default router;
