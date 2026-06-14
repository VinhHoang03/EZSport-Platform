import express from "express";
import {
  getChatHistory,
  saveChatMessages,
  clearChatHistory,
} from "../controllers/chatHistory.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập
router.get("/", verifyToken as any, getChatHistory as any);           // Lấy lịch sử
router.post("/", verifyToken as any, saveChatMessages as any);        // Lưu tin nhắn
router.delete("/", verifyToken as any, clearChatHistory as any);      // Xóa lịch sử

export default router;
