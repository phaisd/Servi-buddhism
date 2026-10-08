import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { AttendanceStatus } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

export async function getClasses(tenantId: string, instructorId?: string) {
  const where: Prisma.AttendanceClassWhereInput = { tenantId };
  if (instructorId) where.instructorId = instructorId;

  return db.attendanceClass.findMany({
    where,
    include: { instructor: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClass(
  tenantId: string,
  actorId: string,
  data: Omit<Prisma.AttendanceClassCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "sessions" | "instructor"> & { instructorId: string }
) {
  const result = await db.attendanceClass.create({
    data: {
      tenantId,
      ...data,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.class.create",
    entity: "AttendanceClass",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function getSessions(tenantId: string, classId: string) {
  return db.attendanceSession.findMany({
    where: { tenantId, classId },
    orderBy: { date: "desc" },
    include: { _count: { select: { records: true } } },
  });
}

export async function createSession(
  tenantId: string,
  actorId: string,
  data: Omit<Prisma.AttendanceSessionCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "classObj" | "records"> & { classId: string }
) {
  const result = await db.attendanceSession.create({
    data: {
      tenantId,
      ...data,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.session.create",
    entity: "AttendanceSession",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function getRecords(tenantId: string, sessionId: string) {
  return db.attendanceRecord.findMany({
    where: { tenantId, sessionId },
    orderBy: { studentCode: "asc" },
  });
}

export async function upsertRecord(
  tenantId: string,
  actorId: string,
  data: {
    sessionId: string;
    studentCode: string;
    studentName: string;
    status: AttendanceStatus;
    note?: string | null;
  }
) {
  const result = await db.attendanceRecord.upsert({
    where: {
      sessionId_studentCode: {
        sessionId: data.sessionId,
        studentCode: data.studentCode,
      }
    },
    create: {
      tenantId,
      sessionId: data.sessionId,
      studentCode: data.studentCode,
      studentName: data.studentName,
      status: data.status,
      note: data.note,
    },
    update: {
      studentName: data.studentName,
      status: data.status,
      note: data.note,
    }
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.record.upsert",
    entity: "AttendanceRecord",
    entityId: result.id,
    after: result,
  });

  return result;
}
