"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "./permissions";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from "./_internal/services";
import {
  curriculumSchema,
  updateCurriculumSchema,
} from "./_internal/validations";

export async function createCurriculumAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = curriculumSchema.parse(data);
  return createCurriculum(session.tenantId, session.userId, parsed);
}

export async function updateCurriculumAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  const parsed = updateCurriculumSchema.parse(data);
  return updateCurriculum(session.tenantId, session.userId, id, parsed);
}

export async function deleteCurriculumAction(id: string) {
  const session = await requireSession();
  await requirePermission(CURRICULUM_P.manage);
  return deleteCurriculum(session.tenantId, session.userId, id);
}
