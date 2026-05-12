import express from "express";
import { getCourts, createCourt, deleteCourt } from "../controllers/court.controller";

const router = express.Router();

router.get("/", getCourts);
router.post("/", createCourt);
router.delete("/:id", deleteCourt);

export default router;
