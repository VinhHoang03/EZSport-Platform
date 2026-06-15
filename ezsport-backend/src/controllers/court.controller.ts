import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Court from "../models/court.model";
import Venue from "../models/venue.model";
import { CourtService } from "../services/court.service";


const parseSportTypes = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try { return JSON.parse(raw); } catch { return [String(raw)]; }
};

const parsePricingRules = (raw: any) => {
  if (!raw) return [];
  const parsed = Array.isArray(raw) ? raw : (() => {
    try { return JSON.parse(raw); } catch { return []; }
  })();

  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((rule: any) => ({
      label: String(rule.label || "").trim(),
      startTime: String(rule.startTime || "").trim(),
      endTime: String(rule.endTime || "").trim(),
      price: Number(rule.price || 0),
      isActive: rule.isActive !== false,
    }))
    .filter(rule => rule.startTime && rule.endTime && rule.price >= 0);
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
    // Handle both JSON and FormData
    let body = { ...req.body };
    const files = (req.files as Express.Multer.File[]) || [];

    // Debug logging
    console.log('=== CREATE COURT ===');
    console.log('Content-Type:', req.get('content-type'));
    console.log('Body:', body);
    console.log('Files:', files.length);

    // Venue ID
    let venueId = body.venue;

    if (!venueId) {
      console.error('❌ Venue not found');
      return res.status(400).json({
        message: "venue is required",
        debug: { receivedBody: body }
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Parse sportTypes
    if (typeof body.sportTypes === 'string') {
      try {
        body.sportTypes = JSON.parse(body.sportTypes);
      } catch (e) {
        body.sportTypes = [body.sportTypes];
      }
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

    if (body.pricingRules) {
      body.pricingRules = parsePricingRules(body.pricingRules);
      if (body.pricingRules.length && !body.pricePerHour) {
        body.pricePerHour = body.pricingRules[0].price;
      }
    }

    const court = new Court(body);
    await court.save();

    console.log('✅ Court created:', court._id);
    res.status(201).json({ message: "Create court success", data: serializeCourt(court) });
  } catch (error: any) {
    console.error('❌ Create court error:', error.message);
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

    if (body.pricingRules) {
      body.pricingRules = parsePricingRules(body.pricingRules);
      if (body.pricingRules.length && !body.pricePerHour) {
        body.pricePerHour = body.pricingRules[0].price;
      }
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

export const suggestCourts = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0]?.msg || "Dữ liệu yêu cầu không hợp lệ",
        errors: errors.array(),
      });
    }

    const { prompt, history, userLat, userLng, maxDistance, limit } = req.body;

    const result = await CourtService.suggestCourts({
      prompt: prompt.trim(),
      history,
      userLat: userLat ? parseFloat(userLat) : undefined,
      userLng: userLng ? parseFloat(userLng) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : 10,
      limit: limit ? parseInt(limit) : 5,
    });

    res.status(200).json({
      message: "AI court suggestions generated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in suggestCourts controller:", error);
    res.status(500).json({
      message: "Failed to suggest courts",
      error: error.message,
    });
  }
};

export const generateDescription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ message: "Court ID is required" });
    }

    const description = await CourtService.generateCourtDescription(id);
    await Court.findByIdAndUpdate(id, { description });

    res.status(200).json({
      message: "Court description generated successfully",
      data: { description },
    });
  } catch (error: any) {
    console.error("Error in generateDescription controller:", error);
    res.status(500).json({
      message: "Failed to generate court description",
      error: error.message,
    });
  }
};

export const compareCourts = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0]?.msg || "Dữ liệu yêu cầu không hợp lệ",
        errors: errors.array(),
      });
    }

    const { courtIds } = req.body;
    const comparison = await CourtService.compareCourts(courtIds);

    res.status(200).json({
      message: "Courts compared successfully",
      data: { comparison },
    });
  } catch (error: any) {
    console.error("Error in compareCourts controller:", error);
    res.status(500).json({
      message: "Failed to compare courts",
      error: error.message,
    });
  }
};

