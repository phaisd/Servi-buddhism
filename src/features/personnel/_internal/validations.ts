import { z } from "zod";

export const departmentSchema = z.object({
  nameTh: z.string().min(1, "Required"),
  nameEn: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
});

export const personnelSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  firstNameTh: z.string().min(1, "Required"),
  lastNameTh: z.string().min(1, "Required"),
  firstNameEn: z.string().optional().nullable(),
  lastNameEn: z.string().optional().nullable(),
  positionTh: z.string().min(1, "Required"),
  positionEn: z.string().optional().nullable(),
  type: z.enum(["EXECUTIVE", "ACADEMIC", "SUPPORT"]),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export const updateDepartmentSchema = departmentSchema.partial();
export const updatePersonnelSchema = personnelSchema.partial();
