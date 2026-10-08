"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "./permissions";
import {
  createClass,
  createSession,
  upsertRecord,
} from "./_internal/services";
import {
  attendanceClassSchema,
  attendanceSessionSchema,
  attendanceRecordSchema,
} from "./_internal/validations";

export async function createClassAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceClassSchema.parse(data);
  return createClass(session.tenantId, session.userId, {
    ...parsed,
    instructorId: session.userId, // Assume creator is the instructor for now
  });
}

export async function createSessionAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceSessionSchema.parse(data);
  return createSession(session.tenantId, session.userId, parsed);
}

export async function upsertRecordAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceRecordSchema.parse(data);
  return upsertRecord(session.tenantId, session.userId, parsed);
}
