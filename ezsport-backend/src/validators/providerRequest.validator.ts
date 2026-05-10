import { z } from "zod";

export const providerRequestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long"),

  experienceYears: z
    .number()
    .int()
    .min(0, "Experience years must be >= 0")
    .max(60),

  serviceCategories: z
    .array(z.string().min(1))
    .min(1, "At least one service category is required"),

  workingAreas: z
    .array(z.string().min(1))
    .min(1, "At least one working area is required"),
});