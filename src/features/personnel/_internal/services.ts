import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { PersonnelType } from "@/generated/prisma";

// ==========================================
// Departments
// ==========================================

export async function getDepartments(tenantId: string) {
  return db.department.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
  });
}

export async function createDepartment(tenantId: string, actorId: string, data: { nameTh: string; nameEn?: string | null; orderIndex?: number }) {
  const result = await db.department.create({
    data: {
      tenantId,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      orderIndex: data.orderIndex ?? 0,
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

export async function updateDepartment(tenantId: string, actorId: string, id: string, data: { nameTh?: string; nameEn?: string | null; orderIndex?: number }) {
  const before = await db.department.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.department.update({
    where: { id, tenantId },
    data,
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
  if (!before) throw new Error("Not found");

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

// ==========================================
// Personnel
// ==========================================

export async function getPersonnelList(tenantId: string, filters?: { departmentId?: string; type?: PersonnelType; search?: string }) {
  const where: import("@/generated/prisma").Prisma.PersonnelWhereInput = { tenantId };
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.type) where.type = filters.type;
  if (filters?.search) {
    where.OR = [
      { firstNameTh: { contains: filters.search } },
      { lastNameTh: { contains: filters.search } },
      { positionTh: { contains: filters.search } },
    ];
  }

  return db.personnel.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublicPersonnelList(tenantId: string, filters?: { departmentId?: string; type?: PersonnelType; search?: string }) {
  const where: import("@/generated/prisma").Prisma.PersonnelWhereInput = { tenantId, isActive: true };
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.type) where.type = filters.type;
  if (filters?.search) {
    where.OR = [
      { firstNameTh: { contains: filters.search } },
      { lastNameTh: { contains: filters.search } },
      { positionTh: { contains: filters.search } },
    ];
  }

  return db.personnel.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
  });
}

export async function createPersonnel(tenantId: string, actorId: string, data: Omit<import("@/generated/prisma").Prisma.PersonnelCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "department"> & { departmentId?: string | null }) {
  const result = await db.personnel.create({
    data: {
      tenantId,
      ...data,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.create",
    entity: "Personnel",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updatePersonnel(tenantId: string, actorId: string, id: string, data: Partial<Omit<import("@/generated/prisma").Prisma.PersonnelCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "department"> & { departmentId?: string | null }>) {
  const before = await db.personnel.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.personnel.update({
    where: { id, tenantId },
    data,
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.update",
    entity: "Personnel",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}

export async function deletePersonnel(tenantId: string, actorId: string, id: string) {
  const before = await db.personnel.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  await db.personnel.delete({ where: { id, tenantId } });

  await writeAudit({
    tenantId,
    actorId,
    action: "personnel.delete",
    entity: "Personnel",
    entityId: id,
    before,
  });
  return true;
}
