import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { CertificateRequestStatus } from "@/generated/prisma";

// ==========================================
// Certificate Types
// ==========================================

export async function getCertificateTypes(tenantId: string) {
  return db.certificateType.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveCertificateTypes(tenantId: string) {
  return db.certificateType.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getCertificateTypeById(tenantId: string, id: string) {
  return db.certificateType.findUnique({
    where: { id, tenantId },
  });
}

export async function createCertificateType(tenantId: string, actorId: string, data: { name: string; description?: string; isActive?: boolean }) {
  const result = await db.certificateType.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "certificateType.create",
    entity: "CertificateType",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateCertificateType(tenantId: string, actorId: string, id: string, data: { name?: string; description?: string; isActive?: boolean }) {
  const before = await db.certificateType.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.certificateType.update({
    where: { id, tenantId },
    data,
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "certificateType.update",
    entity: "CertificateType",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}

// ==========================================
// Certificate Requests
// ==========================================

export async function getMyCertificateRequests(tenantId: string, userId: string) {
  return db.certificateRequest.findMany({
    where: { tenantId, userId },
    include: { certificateType: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllCertificateRequests(tenantId: string) {
  return db.certificateRequest.findMany({
    where: { tenantId },
    include: { 
      certificateType: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCertificateRequestById(tenantId: string, id: string) {
  return db.certificateRequest.findUnique({
    where: { id, tenantId },
    include: {
      certificateType: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function createCertificateRequest(tenantId: string, userId: string, data: { certificateTypeId: string; note?: string }) {
  const result = await db.certificateRequest.create({
    data: {
      tenantId,
      userId,
      certificateTypeId: data.certificateTypeId,
      note: data.note,
      status: CertificateRequestStatus.PENDING,
    },
  });

  await writeAudit({
    tenantId,
    actorId: userId,
    action: "certificateRequest.create",
    entity: "CertificateRequest",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function reviewCertificateRequest(tenantId: string, actorId: string, id: string, data: { status: CertificateRequestStatus; reason?: string; issuedDocumentUrl?: string }) {
  const before = await db.certificateRequest.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.certificateRequest.update({
    where: { id, tenantId },
    data: {
      status: data.status,
      reason: data.reason,
      issuedDocumentUrl: data.issuedDocumentUrl,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "certificateRequest.review",
    entity: "CertificateRequest",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}
