import { z } from "zod";

export const createPlaymateSchema = z.object({
  sport: z.enum(["Pickleball", "Cầu lông", "Bóng đá", "Tennis"], {
    message: "Bộ môn thể thao không hợp lệ hoặc để trống"
  }),
  creatorLevel: z.enum(["Mới chơi", "Trung bình", "Khá / Pro"], {
    message: "Trình độ yêu cầu không hợp lệ hoặc để trống"
  }),
  title: z.string().min(5, "Tiêu đề phải tối thiểu 5 ký tự").max(100, "Tiêu đề tối đa 100 ký tự"),
  description: z.string().optional().or(z.literal("")),
  venueName: z.string().min(1, "Tên địa điểm sân không được để trống"),
  timeSlot: z.string().min(1, "Khung giờ chơi không được để trống"),
  dateStr: z.string().min(1, "Ngày chơi không được để trống"),
  slotsTotal: z.number().min(2, "Số lượng slots tối thiểu phải là 2"),
});

export const updatePlaymateSchema = z.object({
  sport: z.enum(["Pickleball", "Cầu lông", "Bóng đá", "Tennis"]).optional(),
  creatorLevel: z.enum(["Mới chơi", "Trung bình", "Khá / Pro"]).optional(),
  title: z.string().min(5).max(100).optional(),
  description: z.string().optional(),
  venueName: z.string().min(1).optional(),
  timeSlot: z.string().min(1).optional(),
  dateStr: z.string().min(1).optional(),
  slotsTotal: z.number().min(2).optional(),
  status: z.enum(["open", "full", "cancelled", "completed"]).optional(),
});
