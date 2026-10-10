"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "./permissions";
import { revalidatePath } from "next/cache";
import {
  createClass,
  updateClass,
  deleteClass,
  createSession,
  deleteSession,
  upsertRecord,
  batchUpsertRecords,
} from "./_internal/services";
import {
  attendanceClassSchema,
  updateAttendanceClassSchema,
  attendanceSessionSchema,
  attendanceRecordSchema,
  batchSaveRecordsSchema,
} from "./_internal/validations";

export async function createClassAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceClassSchema.parse(data);
  const res = await createClass(session.tenantId, session.userId, {
    courseCode: parsed.courseCode,
    courseName: parsed.courseName,
    term: parsed.term,
    isActive: parsed.isActive,
    instructorId: session.userId, // Assume creator is the instructor for now
    students: parsed.students,
  });
  revalidatePath("/attendance/classes");
  return res;
}

export async function updateClassAction(classId: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = updateAttendanceClassSchema.parse(data);
  const res = await updateClass(session.tenantId, session.userId, classId, parsed);
  revalidatePath("/attendance/classes");
  revalidatePath(`/attendance/classes/${classId}/sessions`);
  return res;
}

export async function deleteClassAction(classId: string) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const res = await deleteClass(session.tenantId, session.userId, classId);
  revalidatePath("/attendance/classes");
  return res;
}

export async function createSessionAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceSessionSchema.parse(data);
  const res = await createSession(session.tenantId, session.userId, parsed);
  revalidatePath(`/attendance/classes/${parsed.classId}/sessions`);
  return res;
}

export async function deleteSessionAction(classId: string, sessionId: string) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const res = await deleteSession(session.tenantId, session.userId, sessionId);
  revalidatePath(`/attendance/classes/${classId}/sessions`);
  return res;
}

export async function upsertRecordAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = attendanceRecordSchema.parse(data);
  return upsertRecord(session.tenantId, session.userId, parsed);
}

export async function batchSaveRecordsAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(ATTENDANCE_P.manage);
  const parsed = batchSaveRecordsSchema.parse(data);
  return batchUpsertRecords(session.tenantId, session.userId, parsed.sessionId, parsed.records);
}
