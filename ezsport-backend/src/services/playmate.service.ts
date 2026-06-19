import { Playmate, IPlaymate } from "../models/playmate.model";
import mongoose from "mongoose";

class PlaymateService {
  /**
   * Get all playmate matchmaking listings, supporting search and filtering.
   */
  async getPlaymates(filters: {
    sport?: string;
    level?: string;
    search?: string;
  }) {
    const query: any = {};

    if (filters.sport && filters.sport !== "Tất cả") {
      query.sport = filters.sport;
    }

    if (filters.level && filters.level !== "Tất cả") {
      query.creatorLevel = filters.level;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venueName: searchRegex },
      ];
    }

    return await Playmate.find(query)
      .populate("creator", "fullName username email avatar phone role")
      .populate("participants", "fullName username email avatar phone role")
      .sort({ createdAt: -1 });
  }

  /**
   * Create a new playmate matchmaking request.
   */
  async createPlaymate(
    data: any,
    creatorId: string
  ): Promise<IPlaymate> {
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    
    const playmate = new Playmate({
      ...data,
      creator: creatorObjectId,
      participants: [creatorObjectId],
      status: "open",
    });

    const saved = await playmate.save();
    return await saved.populate([
      { path: "creator", select: "fullName username email avatar phone role" },
      { path: "participants", select: "fullName username email avatar phone role" }
    ]);
  }

  /**
   * Join an existing playmate matchmaking session.
   */
  async joinPlaymate(playmateId: string, userId: string): Promise<IPlaymate> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const playmate = await Playmate.findById(playmateId);
    if (!playmate) {
      throw new Error("Không tìm thấy tin tìm bạn chơi");
    }

    if (playmate.participants.some(id => id.toString() === userId)) {
      throw new Error("Bạn đã tham gia trận đấu này rồi");
    }

    if (playmate.participants.length >= playmate.slotsTotal) {
      throw new Error("Trận đấu này đã đủ người");
    }

    playmate.participants.push(userObjectId);

    if (playmate.participants.length >= playmate.slotsTotal) {
      playmate.status = "full";
    }

    const saved = await playmate.save();
    return await saved.populate([
      { path: "creator", select: "fullName username email avatar phone role" },
      { path: "participants", select: "fullName username email avatar phone role" }
    ]);
  }

  /**
   * Leave a playmate matchmaking session.
   */
  async leavePlaymate(playmateId: string, userId: string): Promise<IPlaymate> {
    const playmate = await Playmate.findById(playmateId);
    if (!playmate) {
      throw new Error("Không tìm thấy tin tìm bạn chơi");
    }

    if (playmate.creator.toString() === userId) {
      throw new Error("Chủ phòng không thể rời trận đấu. Hãy xóa tin đăng nếu muốn hủy.");
    }

    const initialLength = playmate.participants.length;
    playmate.participants = playmate.participants.filter(
      id => id.toString() !== userId
    );

    if (playmate.participants.length === initialLength) {
      throw new Error("Bạn chưa tham gia trận đấu này");
    }

    if (playmate.participants.length < playmate.slotsTotal) {
      playmate.status = "open";
    }

    const saved = await playmate.save();
    return await saved.populate([
      { path: "creator", select: "fullName username email avatar phone role" },
      { path: "participants", select: "fullName username email avatar phone role" }
    ]);
  }

  /**
   * Delete/Cancel a playmate matchmaking session.
   */
  async deletePlaymate(playmateId: string, userId: string): Promise<void> {
    const playmate = await Playmate.findById(playmateId);
    if (!playmate) {
      throw new Error("Không tìm thấy tin tìm bạn chơi");
    }

    if (playmate.creator.toString() !== userId) {
      throw new Error("Bạn không có quyền xóa tin tìm bạn chơi này");
    }

    await Playmate.findByIdAndDelete(playmateId);
  }
}

export const playmateService = new PlaymateService();
