import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || v.startsWith("/") || z.string().url().safeParse(v).success, {
      message: "url",
    })
    .or(z.literal(""))
    .default(""),
  palette: z.enum(PALETTE_IDS),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
