import { z } from "zod";

export const newsCategoryEnum = z.enum([
  "ACADEMIC",
  "EVENT",
  "GENERAL",
  "PROCUREMENT",
  "BUDDHIST_AFFAIRS",
]);

export const newsStatusEnum = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export const createNewsAttachmentSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().max(500),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024), // max 10MB
  mimeType: z.string().max(100),
  orderIndex: z.number().int().default(0),
});

export const createNewsArticleSchema = z.object({
  titleTh: z.string().min(3).max(255),
  titleEn: z.string().max(255).optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  summaryTh: z.string().max(1000).optional().nullable(),
  summaryEn: z.string().max(1000).optional().nullable(),
  contentTh: z.string().min(5),
  contentEn: z.string().optional().nullable(),
  coverImageUrl: z.string().max(500).optional().nullable(),
  category: newsCategoryEnum.default("GENERAL"),
  status: newsStatusEnum.default("DRAFT"),
  isPinned: z.boolean().default(false),
  pinOrder: z.number().int().optional().nullable(),
  publishedAt: z.string().datetime({ offset: true }).optional().nullable(),
  attachments: z.array(createNewsAttachmentSchema).max(5).optional(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export const changeNewsStatusSchema = z.object({
  id: z.string().uuid(),
  status: newsStatusEnum,
  rejectionReason: z.string().max(1000).optional().nullable(),
});

export const togglePinNewsSchema = z.object({
  id: z.string().uuid(),
  isPinned: z.boolean(),
  pinOrder: z.number().int().optional().nullable(),
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type ChangeNewsStatusInput = z.infer<typeof changeNewsStatusSchema>;
export type TogglePinNewsInput = z.infer<typeof togglePinNewsSchema>;
export type CreateNewsAttachmentInput = z.infer<typeof createNewsAttachmentSchema>;
