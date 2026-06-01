import { Request, Response } from "express";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model";
import { User } from "../models/user.model";

/**
 * Lấy danh sách tất cả conversations của user hiện tại
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Tìm conversations dựa trên role
    const query =
      userRole === "owner"
        ? { "participants.owner": userId }
        : { "participants.player": userId };

    const conversations = await Conversation.find(query)
      .populate("participants.player", "fullName email avatar")
      .populate("participants.owner", "fullName email avatar")
      .populate("venue", "name")
      .sort({ "lastMessage.timestamp": -1 });

    res.status(200).json({
      message: "Lấy danh sách hội thoại thành công",
      data: conversations,
    });
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy chi tiết một conversation (bao gồm tất cả messages)
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const conversation = await Conversation.findById(id)
      .populate("participants.player", "fullName email avatar")
      .populate("participants.owner", "fullName email avatar")
      .populate("venue", "name");

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    // Kiểm tra quyền truy cập
    const isParticipant =
      conversation.participants.player.toString() === userId ||
      conversation.participants.owner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập hội thoại này" });
    }

    // Đánh dấu tin nhắn đã đọc
    if (userRole === "owner") {
      conversation.unreadCount.owner = 0;
      conversation.messages.forEach((msg) => {
        if (msg.senderRole === "player") {
          msg.isRead = true;
        }
      });
    } else {
      conversation.unreadCount.player = 0;
      conversation.messages.forEach((msg) => {
        if (msg.senderRole === "owner") {
          msg.isRead = true;
        }
      });
    }

    await conversation.save();

    res.status(200).json({
      message: "Lấy chi tiết hội thoại thành công",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Tạo hoặc lấy conversation giữa player và owner
 */
export const createOrGetConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { otherUserId, venueId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "Thiếu thông tin người dùng" });
    }

    // Xác định player và owner
    let playerId: string, ownerId: string;

    if (userRole === "owner") {
      ownerId = userId;
      playerId = otherUserId;
    } else {
      playerId = userId;
      ownerId = otherUserId;
    }

    // Kiểm tra user có tồn tại không
    const [player, owner] = await Promise.all([
      User.findById(playerId),
      User.findById(ownerId),
    ]);

    if (!player || !owner) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Tìm conversation đã tồn tại
    let conversation = await Conversation.findOne({
      "participants.player": playerId,
      "participants.owner": ownerId,
    })
      .populate("participants.player", "fullName email avatar")
      .populate("participants.owner", "fullName email avatar")
      .populate("venue", "name");

    // Nếu chưa có, tạo mới
    if (!conversation) {
      conversation = new Conversation({
        participants: {
          player: playerId,
          owner: ownerId,
        },
        venue: venueId || undefined,
        messages: [],
        unreadCount: {
          player: 0,
          owner: 0,
        },
      });

      await conversation.save();

      // Populate sau khi save
      conversation = await Conversation.findById(conversation._id)
        .populate("participants.player", "fullName email avatar")
        .populate("participants.owner", "fullName email avatar")
        .populate("venue", "name");
    }

    res.status(200).json({
      message: "Lấy hội thoại thành công",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error creating/getting conversation:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Gửi tin nhắn trong conversation
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { conversationId, text } = req.body;

    if (!userId || !conversationId || !text) {
      return res.status(400).json({ message: "Thiếu thông tin tin nhắn" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    // Kiểm tra quyền
    const isParticipant =
      conversation.participants.player.toString() === userId ||
      conversation.participants.owner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn không có quyền gửi tin nhắn trong hội thoại này" });
    }

    // Thêm tin nhắn mới
    const newMessage = {
      sender: new mongoose.Types.ObjectId(userId) as any,
      senderRole: userRole as "player" | "owner",
      text: text.trim(),
      timestamp: new Date(),
      isRead: false,
    };

    conversation.messages.push(newMessage);

    // Cập nhật lastMessage
    conversation.lastMessage = {
      text: text.trim(),
      timestamp: new Date(),
      sender: new mongoose.Types.ObjectId(userId) as any,
    };

    // Tăng unread count cho người nhận
    if (userRole === "owner") {
      conversation.unreadCount.player += 1;
    } else {
      conversation.unreadCount.owner += 1;
    }

    await conversation.save();

    // Populate để trả về đầy đủ thông tin
    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants.player", "fullName email avatar")
      .populate("participants.owner", "fullName email avatar")
      .populate("venue", "name");

    res.status(200).json({
      message: "Gửi tin nhắn thành công",
      data: updatedConversation,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Đánh dấu tất cả tin nhắn trong conversation là đã đọc
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    // Kiểm tra quyền
    const isParticipant =
      conversation.participants.player.toString() === userId ||
      conversation.participants.owner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập hội thoại này" });
    }

    // Đánh dấu đã đọc
    if (userRole === "owner") {
      conversation.unreadCount.owner = 0;
      conversation.messages.forEach((msg) => {
        if (msg.senderRole === "player") {
          msg.isRead = true;
        }
      });
    } else {
      conversation.unreadCount.player = 0;
      conversation.messages.forEach((msg) => {
        if (msg.senderRole === "owner") {
          msg.isRead = true;
        }
      });
    }

    await conversation.save();

    res.status(200).json({
      message: "Đã đánh dấu tin nhắn là đã đọc",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error marking as read:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Xóa conversation (soft delete - chỉ xóa messages)
 */
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại" });
    }

    // Kiểm tra quyền
    const isParticipant =
      conversation.participants.player.toString() === userId ||
      conversation.participants.owner.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: "Bạn không có quyền xóa hội thoại này" });
    }

    // Xóa conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({
      message: "Đã xóa hội thoại thành công",
    });
  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
