import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Required").max(255),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
}).refine((data) => data.startDate < data.endDate, {
  message: "End time must be after start time",
  path: ["endDate"],
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  studentCode: z.string().min(1).max(50),
  studentName: z.string().min(1).max(255),
});
