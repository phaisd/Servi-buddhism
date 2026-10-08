"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { ADMINISTRATION_P } from "./permissions";
import {
  createAdminDocument,
  updateAdminDocument,
  deleteAdminDocument,
} from "./_internal/services";
import {
  adminDocumentSchema,
  updateAdminDocumentSchema,
} from "./_internal/validations";

export async function createAdminDocumentAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ADMINISTRATION_P.manage);
  const parsed = adminDocumentSchema.parse(data);
  return createAdminDocument(session.tenantId, session.userId, parsed);
}

export async function updateAdminDocumentAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(ADMINISTRATION_P.manage);
  const parsed = updateAdminDocumentSchema.parse(data);
  return updateAdminDocument(session.tenantId, session.userId, id, parsed);
}

export async function deleteAdminDocumentAction(id: string) {
  const session = await requireSession();
  await requirePermission(ADMINISTRATION_P.manage);
  return deleteAdminDocument(session.tenantId, session.userId, id);
}
