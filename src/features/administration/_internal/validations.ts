import { z } from "zod";

export const adminDocumentSchema = z.object({
  title: z.string().min(1, "Required").max(255),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url("Must be a valid URL").max(1000),
  category: z.enum(["FORM", "MANUAL", "POLICY", "OTHER"]),
  visibility: z.enum(["PUBLIC", "INTERNAL"]),
  isPublished: z.boolean().default(true),
});

export const updateAdminDocumentSchema = adminDocumentSchema.partial();
