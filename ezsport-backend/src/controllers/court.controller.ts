import { Request, Response } from "express";
import Court from "../models/court.model";
import { User } from "../models/user.model";
import CheckIn from "../models/checkin.model";
import { calculateDistance } from "../utils/distance.util";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse sportTypes from body — accepts string or JSON array */
const parseSportTypes = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try { return JSON.parse(raw); } catch { return [String(raw)]; }
};

/** Parse amenities from body — accepts JSON string or array */
const parseAmenities = (raw: any) => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return undefined; }
};

/** Normalize court object for frontend compatibility */
const serializeCourt = (court: any) => {
  const doc = court?.toObject ? court.toObject() : court;
  const sportType = Array.isArray(doc.sportTypes) && doc.sportTypes.length
    ? doc.sportTypes[0]
    : doc.sportType;
  return { ...doc, sportType };
};

// ── GET /courts ───────────────────────────────────────────────────────────────
export const getCourts = async (req: Request, res: Response) => {
  try {
    const { sport, search, active } = req.query;
    const filter: any = {};

    if (active !== 'all') filter.isActive = true;
    if (sport) filter.sportTypes = { $in: [sport] };
    if (search) filter.$text = { $search: String(search) };

    const courts = await Court.find(filter).sort({ rating: -1 });
    res.status(200).json({ message: "Fetch courts success", data: courts.map(serializeCourt) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /courts/:id ───────────────────────────────────────────────────────────
export const getCourtById = async (req: Request, res: Response) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Fetch court success", data: serializeCourt(court) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /courts ──────────────────────────────────────────────────────────────
export const createCourt = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };

    // Image from Cloudinary upload
    if (req.file?.path) body.image = req.file.path;

    // Parse array fields
    body.sportTypes = parseSportTypes(body.sportTypes ?? body.sportType);
    if (!body.sportTypes.length) {
      return res.status(400).json({ message: "sportTypes là bắt buộc" });
    }

    // Backward compat: keep emoji from first sport if not provided
    if (!body.emoji) {
      const emojiMap: Record<string, string> = {
        badminton: '🏸', pickleball: '🏓', soccer: '⚽', tennis: '🎾', basketball: '🏀',
      };
      body.emoji = emojiMap[body.sportTypes[0]] ?? '🏟️';
    }

    // pricePerHour: parse from price string if not provided
    if (!body.pricePerHour && body.price) {
      const num = parseInt(String(body.price).replace(/[^0-9]/g, ''), 10);
      body.pricePerHour = num < 10000 ? num * 1000 : num;
    }

    const amenities = parseAmenities(body.amenities);
    if (amenities) body.amenities = amenities;

    const court = new Court(body);
    await court.save();

    res.status(201).json({ message: "Create court success", data: serializeCourt(court) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── PUT /courts/:id ───────────────────────────────────────────────────────────
export const updateCourt = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };

    if (req.file?.path) body.image = req.file.path;

    if (body.sportTypes || body.sportType) {
      body.sportTypes = parseSportTypes(body.sportTypes ?? body.sportType);
    }

    if (body.price && !body.pricePerHour) {
      const num = parseInt(String(body.price).replace(/[^0-9]/g, ''), 10);
      body.pricePerHour = num < 10000 ? num * 1000 : num;
    }

    const amenities = parseAmenities(body.amenities);
    if (amenities) body.amenities = amenities;

    // Remove legacy field
    delete body.sportType;

    const updated = await Court.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Update court success", data: serializeCourt(updated) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── DELETE /courts/:id ────────────────────────────────────────────────────────
export const deleteCourt = async (req: Request, res: Response) => {
  try {
    const deleted = await Court.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Court not found" });
    res.status(200).json({ message: "Delete court success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── POST /courts/:id/check-in ─────────────────────────────────────────────────
export const checkIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userLat, userLng } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ message: "Court not found" });

    const distance = calculateDistance(userLat, userLng, court.lat, court.lng);
    if (distance > 0.2) {
      return res.status(400).json({
        message: "Bạn quá xa sân để check-in",
        distance: distance.toFixed(2) + " km",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await CheckIn.findOne({ user: userId, court: id, createdAt: { $gte: today } });
    if (existing) return res.status(400).json({ message: "Hôm nay bạn đã check-in tại sân này rồi" });

    const pointsToReward = 50;
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsToReward } });

    await new CheckIn({ user: userId, court: id, pointsEarned: pointsToReward, location: { lat: userLat, lng: userLng } }).save();

    const updatedUser = await User.findById(userId) as any;
    res.status(200).json({
      message: "Check-in thành công!",
      pointsEarned: pointsToReward,
      totalPoints: updatedUser?.loyaltyPoints,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
