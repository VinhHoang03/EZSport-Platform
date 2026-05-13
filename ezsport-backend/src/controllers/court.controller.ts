import { Request, Response } from "express";
import Court from "../models/court.model";

export const getCourts = async (req: Request, res: Response) => {
  try {
    const courts = await Court.find({ isActive: true });
    res.status(200).json({
      message: "Fetch courts success",
      data: courts
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourt = async (req: Request, res: Response) => {
  try {
    const newCourt = new Court(req.body);
    await newCourt.save();
    res.status(201).json({
      message: "Create court success",
      data: newCourt
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourt = async (req: Request, res: Response) => {
  try {
    await Court.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete court success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
