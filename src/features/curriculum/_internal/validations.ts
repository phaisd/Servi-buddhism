import { z } from "zod";

export const departmentTypeEnum = z.enum(["DEPARTMENT", "PROGRAM", "DIVISION"]).default("DEPARTMENT");

export const departmentSchema = z.object({
  nameTh: z.string().min(1, "กรุณาระบุชื่อภาษาไทย"),
  nameEn: z.string().optional().nullable(),
  code: z.string().max(50).optional().nullable(),
  type: z.enum(["DEPARTMENT", "PROGRAM", "DIVISION"]).default("DEPARTMENT"),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true).optional(),
});

export const updateDepartmentSchema = departmentSchema.partial();

export const curriculumSchema = z.object({
  nameTh: z.string().min(1, "กรุณาระบุชื่อหลักสูตรภาษาไทย"),
  nameEn: z.string().optional().nullable(),
  degree: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"]),
  durationYears: z.number().int().min(1).max(10).default(4),
  departmentId: z.string().uuid().optional().nullable(),
  majorTh: z.string().optional().nullable(),
  majorEn: z.string().optional().nullable(),
  language: z.enum(["TH", "EN", "TH_EN"]).default("TH").optional(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  imageUrl: z.string().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export const updateCurriculumSchema = curriculumSchema.partial();

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CurriculumInput = z.infer<typeof curriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
