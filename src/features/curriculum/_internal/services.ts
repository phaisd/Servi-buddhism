import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { DegreeLevel } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

export async function getCurriculums(tenantId: string, filters?: { degree?: DegreeLevel; search?: string }) {
  const where: Prisma.CurriculumWhereInput = { tenantId };
  if (filters?.degree) where.degree = filters.degree;
  if (filters?.search) {
    where.OR = [
      { nameTh: { contains: filters.search } },
      { nameEn: { contains: filters.search } },
    ];
  }

  return db.curriculum.findMany({
    where,
    orderBy: [{ degree: "asc" }, { orderIndex: "asc" }],
  });
}

export async function getPublicCurriculums(tenantId: string, filters?: { degree?: DegreeLevel; search?: string }) {
  const where: Prisma.CurriculumWhereInput = { tenantId, isActive: true };
  if (filters?.degree) where.degree = filters.degree;
  if (filters?.search) {
    where.OR = [
      { nameTh: { contains: filters.search } },
      { nameEn: { contains: filters.search } },
    ];
  }

  return db.curriculum.findMany({
    where,
    orderBy: [{ degree: "asc" }, { orderIndex: "asc" }],
  });
}

export async function createCurriculum(
  tenantId: string,
  actorId: string,
  data: Omit<Prisma.CurriculumCreateInput, "tenant" | "id" | "createdAt" | "updatedAt">
) {
  const result = await db.curriculum.create({
    data: {
      tenantId,
      ...data,
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
  data: Partial<Omit<Prisma.CurriculumCreateInput, "tenant" | "id" | "createdAt" | "updatedAt">>
) {
  const before = await db.curriculum.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.curriculum.update({
    where: { id, tenantId },
    data,
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
  if (!before) throw new Error("Not found");

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
