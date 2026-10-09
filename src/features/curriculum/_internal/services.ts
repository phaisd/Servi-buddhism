import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { DegreeLevel } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

// ==========================================
// CURRICULUM SERVICES
// ==========================================

export async function getCurriculums(
  tenantId: string,
  filters?: { degree?: DegreeLevel; departmentId?: string; search?: string }
) {
  const where: Prisma.CurriculumWhereInput = { tenantId };
  if (filters?.degree) where.degree = filters.degree;
  if (filters?.departmentId) {
    if (filters.departmentId === "none") {
      where.departmentId = null;
    } else {
      where.departmentId = filters.departmentId;
    }
  }
  if (filters?.search) {
    where.OR = [
      { nameTh: { contains: filters.search, mode: "insensitive" } },
      { nameEn: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.curriculum.findMany({
    where,
    include: {
      department: true,
    },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublicCurriculums(
  tenantId: string,
  filters?: { degree?: DegreeLevel; departmentId?: string; search?: string }
) {
  const where: Prisma.CurriculumWhereInput = { tenantId, isActive: true };
  if (filters?.degree) where.degree = filters.degree;
  if (filters?.departmentId) {
    if (filters.departmentId === "none") {
      where.departmentId = null;
    } else {
      where.departmentId = filters.departmentId;
    }
  }
  if (filters?.search) {
    where.OR = [
      { nameTh: { contains: filters.search, mode: "insensitive" } },
      { nameEn: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.curriculum.findMany({
    where,
    include: {
      department: true,
    },
    orderBy: [{ degree: "asc" }, { orderIndex: "asc" }],
  });
}

export async function createCurriculum(
  tenantId: string,
  actorId: string,
  data: {
    nameTh: string;
    nameEn?: string | null;
    degree: DegreeLevel;
    durationYears?: number;
    departmentId?: string | null;
    descriptionTh?: string | null;
    descriptionEn?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    orderIndex?: number;
  }
) {
  const result = await db.curriculum.create({
    data: {
      tenantId,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      degree: data.degree,
      durationYears: data.durationYears ?? 4,
      departmentId: data.departmentId || null,
      descriptionTh: data.descriptionTh,
      descriptionEn: data.descriptionEn,
      imageUrl: data.imageUrl,
      isActive: data.isActive ?? true,
      orderIndex: data.orderIndex ?? 0,
    },
    include: {
      department: true,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "curriculum.create",
    entity: "Curriculum",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateCurriculum(
  tenantId: string,
  actorId: string,
  id: string,
  data: Partial<{
    nameTh: string;
    nameEn?: string | null;
    degree: DegreeLevel;
    durationYears?: number;
    departmentId?: string | null;
    descriptionTh?: string | null;
    descriptionEn?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    orderIndex?: number;
  }>
) {
  const before = await db.curriculum.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Curriculum not found");

  const result = await db.curriculum.update({
    where: { id, tenantId },
    data: {
      ...data,
      departmentId: data.departmentId !== undefined ? (data.departmentId || null) : undefined,
    },
    include: {
      department: true,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "curriculum.update",
    entity: "Curriculum",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}

export async function deleteCurriculum(tenantId: string, actorId: string, id: string) {
  const before = await db.curriculum.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Curriculum not found");

  await db.curriculum.delete({ where: { id, tenantId } });

  await writeAudit({
    tenantId,
    actorId,
    action: "curriculum.delete",
    entity: "Curriculum",
    entityId: id,
    before,
  });
  return true;
}

// ==========================================
// DEPARTMENT / PROGRAM / DIVISION SERVICES
// ==========================================

export async function getDepartments(tenantId: string) {
  return db.department.findMany({
    where: { tenantId },
    include: {
      curriculums: {
        select: {
          id: true,
          nameTh: true,
          nameEn: true,
          degree: true,
          durationYears: true,
          isActive: true,
          orderIndex: true,
        },
        orderBy: [{ orderIndex: "asc" }, { nameTh: "asc" }],
      },
      _count: {
        select: {
          curriculums: true,
          personnel: true,
        },
      },
    },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });
}

export async function createDepartment(
  tenantId: string,
  actorId: string,
  data: {
    nameTh: string;
    nameEn?: string | null;
    code?: string | null;
    type?: string | null;
    descriptionTh?: string | null;
    descriptionEn?: string | null;
    orderIndex?: number;
  }
) {
  const result = await db.department.create({
    data: {
      tenantId,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      code: data.code,
      type: data.type ?? "DEPARTMENT",
      descriptionTh: data.descriptionTh,
      descriptionEn: data.descriptionEn,
      orderIndex: data.orderIndex ?? 0,
    },
    include: {
      curriculums: true,
      _count: {
        select: { curriculums: true, personnel: true },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.create",
    entity: "Department",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateDepartment(
  tenantId: string,
  actorId: string,
  id: string,
  data: Partial<{
    nameTh: string;
    nameEn?: string | null;
    code?: string | null;
    type?: string | null;
    descriptionTh?: string | null;
    descriptionEn?: string | null;
    orderIndex?: number;
  }>
) {
  const before = await db.department.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Department not found");

  const result = await db.department.update({
    where: { id, tenantId },
    data,
    include: {
      curriculums: true,
      _count: {
        select: { curriculums: true, personnel: true },
      },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.update",
    entity: "Department",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}

export async function deleteDepartment(tenantId: string, actorId: string, id: string) {
  const before = await db.department.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Department not found");

  await db.department.delete({ where: { id, tenantId } });

  await writeAudit({
    tenantId,
    actorId,
    action: "department.delete",
    entity: "Department",
    entityId: id,
    before,
  });
  return true;
}
