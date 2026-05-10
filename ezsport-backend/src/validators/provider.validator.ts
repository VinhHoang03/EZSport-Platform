import { z } from "zod";

export const updateProviderStatusSchema = z.object({
  activeStatus: z.enum(["ONLINE", "OFFLINE"]),
});