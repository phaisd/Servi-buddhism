"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { CERTIFICATES_P } from "./permissions";
import {
  createCertificateType,
  updateCertificateType,
  createCertificateRequest,
  reviewCertificateRequest,
} from "./_internal/services";
import {
  createCertificateTypeSchema,
  updateCertificateTypeSchema,
  createCertificateRequestSchema,
  reviewCertificateRequestSchema,
} from "./_internal/validations";

export async function createTypeAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(CERTIFICATES_P.typeManage);
  const parsed = createCertificateTypeSchema.parse(data);
  return createCertificateType(session.tenantId, session.userId, parsed);
}

export async function updateTypeAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(CERTIFICATES_P.typeManage);
  const parsed = updateCertificateTypeSchema.parse(data);
  return updateCertificateType(session.tenantId, session.userId, id, parsed);
}

export async function submitRequestAction(data: unknown) {
  const session = await requireSession();
  // Portal users can submit requests without specific admin permission, just a valid session
  const parsed = createCertificateRequestSchema.parse(data);
  return createCertificateRequest(session.tenantId, session.userId, parsed);
}

export async function reviewRequestAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(CERTIFICATES_P.requestManage);
  const parsed = reviewCertificateRequestSchema.parse(data);
  return reviewCertificateRequest(session.tenantId, session.userId, id, parsed);
}
