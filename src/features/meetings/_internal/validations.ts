import { z } from "zod";

export const meetingRoomSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  capacity: z.number().int().min(1).default(10),
  equipment: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
});

export const updateMeetingRoomSchema = meetingRoomSchema.partial();

export const meetingBookingSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  title: z.string().min(1, "Required").max(255),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  remark: z.string().optional().nullable(),
}).refine((data) => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});
