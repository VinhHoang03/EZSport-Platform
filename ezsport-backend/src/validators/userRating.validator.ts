import { z } from "zod";

export const createUserRatingSchema = z.object({
  revieweeId: z.string().min(1, "ID người được đánh giá không được để trống"),
  rating: z.number().min(1, "Đánh giá tối thiểu là 1 sao").max(5, "Đánh giá tối đa là 5 sao"),
  comment: z.string().max(1000, "Nhận xét không được vượt quá 1000 ký tự").optional().or(z.literal("")),
});
