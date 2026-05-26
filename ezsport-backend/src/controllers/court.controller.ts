import { Request, Response } from "express";
import Court from "../models/court.model";
import Venue from "../models/venue.model";

const parseSportTypes = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try { return JSON.parse(raw); } catch { return [String(raw)]; }
};

const serializeCourt = (court: any) => {
  const doc = court?.toObject ? court.toObject() : court;
  return {
    ...doc,
    venue: doc.venue?.toObject ? doc.venue.toObject() : doc.venue,
  };
};

export const getCourts = async (req: Request, res: Response) => {
  try {
    const { venue, sport, active } = req.query;
    const filter: any = {};

    if (venue) filter.venue = venue;
    if (sport) filter.sportTypes = { $in: [sport] };
    if (active !== "all") filter.isActive = true;

    const courts = await Court.find(filter).populate("venue");
    res.status(200).json({ message: "Fetch courts success", data: courts.map(serializeCourt) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourtById = async (req: Request, res: Response) => {
  try {
    const court = await Court.findById(req.params.id).populate("venue");
    if (!court) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Fetch court success", data: serializeCourt(court) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourt = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const files = (req.files as Express.Multer.File[]) || [];

    if (!body.venue) {
      return res.status(400).json({ message: "venue is required" });
    }

    const venue = await Venue.findById(body.venue);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    body.sportTypes = parseSportTypes(body.sportTypes ?? body.sportType);
    if (!body.sportTypes.length) {
      return res.status(400).json({ message: "sportTypes is required" });
    }

    if (!body.emoji) {
      const emojiMap: Record<string, string> = {
        badminton: '🏸', pickleball: '🏓', soccer: '⚽', tennis: '🎾', basketball: '🏀',
      };
      body.emoji = emojiMap[body.sportTypes[0]] ?? '🏟️';
    }

    if (files.length) {
      body.images = files.map((file) => file.path);
    }

    const court = new Court(body);
    await court.save();

    res.status(201).json({ message: "Create court success", data: serializeCourt(court) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCourt = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const files = (req.files as Express.Multer.File[]) || [];

    if (body.sportTypes || body.sportType) {
      body.sportTypes = parseSportTypes(body.sportTypes ?? body.sportType);
    }

    if (files.length) {
      body.images = files.map((file) => file.path);
    }

    delete body.sportType;

    const updated = await Court.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    ).populate("venue");

    if (!updated) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Update court success", data: serializeCourt(updated) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourt = async (req: Request, res: Response) => {
  try {
    const deleted = await Court.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Delete court success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
