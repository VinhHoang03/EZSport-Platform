import { Request, Response } from "express";
import Venue from "../models/venue.model";
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

/** Normalize venue object for frontend compatibility */
const serializeVenue = (venue: any) => {
  const doc = venue?.toObject ? venue.toObject() : venue;
  const sportType = Array.isArray(doc.sportTypes) && doc.sportTypes.length
    ? doc.sportTypes[0]
    : doc.sportType;
  return { ...doc, sportType };
};

// ── GET /venues ───────────────────────────────────────────────────────────────
export const getVenues = async (req: Request, res: Response) => {
  try {
    const { sport, search, active } = req.query;
    const filter: any = {};

    if (active !== 'all') filter.isActive = true;
    if (sport) filter.sportTypes = { $in: [sport] };
    if (search) filter.$text = { $search: String(search) };

    const venues = await Venue.find(filter).sort({ rating: -1 });
    res.status(200).json({ message: "Fetch venues success", data: venues.map(serializeVenue) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /venues/owner/me ──────────────────────────────────────────────────────
export const getMyVenues = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id || req.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { sport, search, active } = req.query;
    const filter: any = { owner: ownerId };

    if (active !== 'all') filter.isActive = true;
    if (sport) filter.sportTypes = { $in: [sport] };
    if (search) filter.$text = { $search: String(search) };

    const venues = await Venue.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ message: "Fetch owner venues success", data: venues.map(serializeVenue) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /venues/:id ───────────────────────────────────────────────────────────
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('owner', 'fullName email avatar');
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.status(200).json({ message: "Fetch venue success", data: serializeVenue(venue) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /venues ──────────────────────────────────────────────────────────────
export const createVenue = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };

    // Auto-assign owner from the logged-in user
    body.owner = req.user?.id || req.id;

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

    const amenities = parseAmenities(body.amenities);
    if (amenities) body.amenities = amenities;

    const venue = new Venue(body);
    await venue.save();

    res.status(201).json({ message: "Create venue success", data: serializeVenue(venue) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── PUT /venues/:id ───────────────────────────────────────────────────────────
export const updateVenue = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };

    // Prevent non-admins from changing combo discounts
    if (req.role !== "admin") {
      delete body.comboWeeklyDiscount;
      delete body.comboMonthlyDiscount;
    }

    if (req.file?.path) body.image = req.file.path;

    if (body.sportTypes || body.sportType) {
      body.sportTypes = parseSportTypes(body.sportTypes ?? body.sportType);
    }

    const amenities = parseAmenities(body.amenities);
    if (amenities) body.amenities = amenities;

    // Remove legacy field
    delete body.sportType;

    const updated = await Venue.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Venue not found" });
    res.status(200).json({ message: "Update venue success", data: serializeVenue(updated) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── DELETE /venues/:id ────────────────────────────────────────────────────────
export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const deleted = await Venue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Venue not found" });
    res.status(200).json({ message: "Delete venue success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ── POST /venues/:id/check-in ─────────────────────────────────────────────────
export const checkIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userLat, userLng } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const venue = await Venue.findById(id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    const distance = calculateDistance(userLat, userLng, venue.lat, venue.lng);
    if (distance > 0.2) {
      return res.status(400).json({
        message: "Bạn quá xa địa điểm để check-in",
        distance: distance.toFixed(2) + " km",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await CheckIn.findOne({ user: userId, venue: id, createdAt: { $gte: today } });
    if (existing) return res.status(400).json({ message: "Hôm nay bạn đã check-in tại địa điểm này rồi" });

    const pointsToReward = 50;
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsToReward } });

    await new CheckIn({ user: userId, venue: id, pointsEarned: pointsToReward, location: { lat: userLat, lng: userLng } }).save();

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
