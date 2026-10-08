import { z } from "zod";

export const curriculumSchema = z.object({
  nameTh: z.string().min(1, "Required"),
  nameEn: z.string().optional().nullable(),
  degree: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"]),
  durationYears: z.number().int().min(1).max(10).default(4),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export const updateCurriculumSchema = curriculumSchema.partial();
