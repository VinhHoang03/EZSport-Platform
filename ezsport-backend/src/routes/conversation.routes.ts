import express from "express";
import {
  getConversations,
  getConversationById,
  createOrGetConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
} from "../controllers/conversation.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập
router.get("/", verifyToken as any, getConversations as any); // Lấy danh sách conversations
router.get("/:id", verifyToken as any, getConversationById as any); // Lấy chi tiết conversation
router.post("/", verifyToken as any, createOrGetConversation as any); // Tạo hoặc lấy conversation
router.post("/message", verifyToken as any, sendMessage as any); // Gửi tin nhắn
router.put("/:conversationId/read", verifyToken as any, markAsRead as any); // Đánh dấu đã đọc
router.delete("/:conversationId", verifyToken as any, deleteConversation as any); // Xóa conversation

export default router;
