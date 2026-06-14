import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const phoneRegex = /^[\d\s\-\+]+$/;

export const createBookingSchema = z.object({
  courtId: z.string().min(1, "Mã sân không được để trống"),
  bookingDate: z.coerce.date().refine(d => !isNaN(d.getTime()), "Ngày đặt sân không hợp lệ"),
  startTime: z.string().regex(timeRegex, "Giờ bắt đầu không hợp lệ (định dạng: HH:mm)"),
  endTime: z.string().regex(timeRegex, "Giờ kết thúc không hợp lệ (định dạng: HH:mm)"),
  duration: z.number().min(0.5, "Thời lượng tối thiểu là 0.5 giờ").max(24, "Thời lượng tối đa là 24 giờ"),
  sport: z.string().min(1, "Môn thể thao không được để trống"),
  basePrice: z.number().min(0, "Giá cơ bản không được âm"),
  serviceFee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  pointsUsed: z.number().min(0).optional(),
  voucherCode: z.string().optional(),
  totalPrice: z.number().min(0, "Tổng giá không được âm"),
  paymentMethod: z.enum(["momo", "vnpay", "cash", "bank"]).optional(),
  bookerName: z.string().min(1, "Tên người đặt không được để trống"),
  bookerPhone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
  bookerEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  startTime: z.string().regex(timeRegex, "Giờ bắt đầu không hợp lệ").optional(),
  endTime: z.string().regex(timeRegex, "Giờ kết thúc không hợp lệ").optional(),
  duration: z.number().min(0.5).max(24).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]).optional(),
  paymentMethod: z.enum(["momo", "vnpay", "cash", "bank"]).optional(),
  bookerName: z.string().optional(),
  bookerPhone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ").optional(),
  bookerEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  notes: z.string().optional(),
});
