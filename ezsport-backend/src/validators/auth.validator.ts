import { z } from "zod";
import { UserRole } from "../enum/user.enum";

export const registerSchema = z.object({
  username: z.string().min(3, "Username phải ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ").optional(),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
  fullName: z.string().min(1, "Họ và tên là bắt buộc"),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PLAYER),
});
