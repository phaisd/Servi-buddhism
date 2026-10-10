"use server";
import fs from "node:fs/promises";
import path from "node:path";

import { requireSession, requirePermission } from "@/features/identity/server";
import { revalidatePath } from "next/cache";
import { CURRICULUM_P } from "./permissions";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
} from "./_internal/services";
import {
  curriculumSchema,
  updateCurriculumSchema,
  departmentSchema,
  updateDepartmentSchema,
} from "./_internal/validations";

// ── Curriculum Actions ──

export async function createCurriculumAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = curriculumSchema.parse(data);
  const res = await createCurriculum(session.tenantId, session.userId, parsed);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function updateCurriculumAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = updateCurriculumSchema.parse(data);
  const res = await updateCurriculum(session.tenantId, session.userId, id, parsed);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function deleteCurriculumAction(id: string) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const res = await deleteCurriculum(session.tenantId, session.userId, id);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function toggleCurriculumActiveAction(id: string, isActive: boolean) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const res = await updateCurriculum(session.tenantId, session.userId, id, { isActive });
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

// ── Department / Program / Division Actions ──

export async function createDepartmentAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = departmentSchema.parse(data);
  const res = await createDepartment(session.tenantId, session.userId, parsed);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function updateDepartmentAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = updateDepartmentSchema.parse(data);
  const res = await updateDepartment(session.tenantId, session.userId, id, parsed);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function deleteDepartmentAction(id: string) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const res = await deleteDepartment(session.tenantId, session.userId, id);
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function toggleDepartmentActiveAction(id: string, isActive: boolean) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const res = await updateDepartment(session.tenantId, session.userId, id, { isActive });
  revalidatePath("/curriculum");
  revalidatePath("/curriculum/departments");
  revalidatePath("/portal/programs");
  return res;
}

export async function getDepartmentsAction() {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.read);
  return getDepartments(session.tenantId);
}

export async function uploadCurriculumImageAction(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const session = await requireSession();
    await requirePermission(CURRICULUM_P.manage);
    const file = formData.get("file");
    if (!file || !(file instanceof File) || file.size === 0) {
      return { ok: false, error: "กรุณาเลือกไฟล์รูปภาพ" };
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return { ok: false, error: "รองรับเฉพาะไฟล์ PNG, JPEG, WebP และ SVG เท่านั้น" };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: "ขนาดไฟล์ต้องไม่เกิน 5MB" };
    }
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "curriculum");
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const ext = ["png", "jpg", "jpeg", "webp", "svg"].includes(rawExt) ? rawExt : "png";
    const filename = `curriculum-${session.tenantId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return { ok: true, url: `/uploads/curriculum/${filename}` };
  } catch (err) {
    return { ok: false, error: (err as Error).message || "อัปโหลดรูปภาพไม่สำเร็จ" };
  }
}

export async function uploadCurriculumDocumentAction(formData: FormData): Promise<{ ok: boolean; url?: string; name?: string; error?: string }> {
  try {
    const session = await requireSession();
    await requirePermission(CURRICULUM_P.manage);
    const file = formData.get("file");
    if (!file || !(file instanceof File) || file.size === 0) {
      return { ok: false, error: "กรุณาเลือกไฟล์เอกสาร" };
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    if (!allowedTypes.includes(file.type) && !["pdf", "doc", "docx", "xls", "xlsx"].includes(rawExt)) {
      return { ok: false, error: "รองรับเฉพาะไฟล์ PDF, Word (.docx) หรือ Excel (.xlsx) เท่านั้น" };
    }
    if (file.size > 20 * 1024 * 1024) {
      return { ok: false, error: "ขนาดไฟล์ต้องไม่เกิน 20MB" };
    }
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "curriculum", "documents");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeExt = ["pdf", "doc", "docx", "xls", "xlsx"].includes(rawExt) ? rawExt : "pdf";
    const filename = `timetable-${session.tenantId}-${Date.now()}.${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return { ok: true, url: `/uploads/curriculum/documents/${filename}`, name: file.name };
  } catch (err) {
    return { ok: false, error: (err as Error).message || "อัปโหลดเอกสารไม่สำเร็จ" };
  }
}
