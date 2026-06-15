import { Request, Response } from "express";
import ChatHistory from "../models/chatHistory.model";

/**
 * Lấy toàn bộ lịch sử chat của user hiện tại
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const history = await ChatHistory.findOne({ user: userId });

    res.status(200).json({
      message: "Lấy lịch sử chat thành công",
      data: history ? history.messages : [],
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Thêm một cặp tin nhắn (user + ai) vào lịch sử
 */
export const saveChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { userMessage, aiMessage } = req.body;

    if (!userMessage || !aiMessage) {
      return res.status(400).json({ message: "Thiếu userMessage hoặc aiMessage" });
    }

    // Upsert: tạo mới nếu chưa có, thêm messages nếu đã có
    await ChatHistory.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          messages: {
            $each: [
              { sender: "user", text: userMessage.text, timestamp: new Date() },
              {
                sender: "ai",
                text: aiMessage.text,
                timestamp: new Date(),
                recommendations: aiMessage.recommendations || [],
                parsedSlot: aiMessage.parsedSlot,
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Lưu lịch sử chat thành công" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Xóa toàn bộ lịch sử chat của user
 */
export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await ChatHistory.findOneAndUpdate(
      { user: userId },
      { $set: { messages: [] } },
      { upsert: true }
    );

    res.status(200).json({ message: "Đã xóa lịch sử chat" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
