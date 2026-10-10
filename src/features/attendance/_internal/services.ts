import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { AttendanceStatus } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

import {
  parseClassStudents,
  injectClassStudents,
  type AttendanceStudentItem,
} from "./student-helpers";

export {
  parseClassStudents,
  injectClassStudents,
  type AttendanceStudentItem,
};

export async function getClasses(tenantId: string, instructorId?: string) {
  const where: Prisma.AttendanceClassWhereInput = { tenantId };
  if (instructorId) where.instructorId = instructorId;

  const list = await db.attendanceClass.findMany({
    where,
    include: {
      instructor: true,
      sessions: {
        orderBy: { date: "desc" },
        include: {
          records: true,
          _count: { select: { records: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list;
}

export async function getClassById(tenantId: string, classId: string) {
  return db.attendanceClass.findFirst({
    where: { id: classId, tenantId },
    include: {
      instructor: true,
      sessions: {
        orderBy: { date: "desc" },
        include: {
          records: true,
          _count: { select: { records: true } },
        },
      },
    },
  });
}

export async function createClass(
  tenantId: string,
  actorId: string,
  data: {
    courseCode: string;
    courseName: string;
    term: string;
    isActive?: boolean;
    instructorId: string;
    students?: AttendanceStudentItem[];
  }
) {
  const { students, ...classData } = data;
  const result = await db.attendanceClass.create({
    data: {
      tenantId,
      ...classData,
    },
  });

  // If initial students provided, create a default roster session or save them
  if (students && students.length > 0) {
    const rosterTopic = injectClassStudents("บัญชีรายชื่อนิสิตประจำวิชา", students);
    await db.attendanceSession.create({
      data: {
        tenantId,
        classId: result.id,
        date: new Date(),
        topic: rosterTopic,
      },
    });
  }

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

export async function updateClass(
  tenantId: string,
  actorId: string,
  classId: string,
  data: {
    courseCode?: string;
    courseName?: string;
    term?: string;
    isActive?: boolean;
    students?: AttendanceStudentItem[];
  }
) {
  const existing = await db.attendanceClass.findFirst({
    where: { id: classId, tenantId },
    include: { sessions: true },
  });
  if (!existing) throw new Error("ไม่พบรายวิชาที่ต้องการแก้ไข");

  const { students, ...classData } = data;
  const result = await db.attendanceClass.update({
    where: { id: classId },
    data: classData,
  });

  if (students !== undefined) {
    // Look for roster session or create one
    const rosterSession = existing.sessions.find((s) => s.topic?.includes("<!-- STUDENTS:"));
    if (rosterSession) {
      const updatedTopic = injectClassStudents(rosterSession.topic || "", students);
      await db.attendanceSession.update({
        where: { id: rosterSession.id },
        data: { topic: updatedTopic },
      });
    } else {
      const rosterTopic = injectClassStudents("บัญชีรายชื่อนิสิตประจำวิชา", students);
      await db.attendanceSession.create({
        data: {
          tenantId,
          classId: result.id,
          date: new Date(),
          topic: rosterTopic,
        },
      });
    }
  }

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.class.update",
    entity: "AttendanceClass",
    entityId: result.id,
    before: existing,
    after: result,
  });

  return result;
}

export async function deleteClass(tenantId: string, actorId: string, classId: string) {
  const existing = await db.attendanceClass.findFirst({
    where: { id: classId, tenantId },
  });
  if (!existing) throw new Error("ไม่พบรายวิชาที่ต้องการลบ");

  await db.attendanceClass.delete({
    where: { id: classId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.class.delete",
    entity: "AttendanceClass",
    entityId: classId,
    before: existing,
  });

  return { success: true };
}

export async function getSessions(tenantId: string, classId: string) {
  return db.attendanceSession.findMany({
    where: { tenantId, classId },
    orderBy: { date: "desc" },
    include: {
      records: { orderBy: { studentCode: "asc" } },
      _count: { select: { records: true } },
    },
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

export async function batchUpsertRecords(
  tenantId: string,
  actorId: string,
  sessionId: string,
  records: Array<{
    studentCode: string;
    studentName: string;
    status: AttendanceStatus;
    note?: string | null;
  }>
) {
  const operations = records.map((rec) =>
    db.attendanceRecord.upsert({
      where: {
        sessionId_studentCode: {
          sessionId,
          studentCode: rec.studentCode,
        },
      },
      create: {
        tenantId,
        sessionId,
        studentCode: rec.studentCode,
        studentName: rec.studentName,
        status: rec.status,
        note: rec.note,
      },
      update: {
        studentName: rec.studentName,
        status: rec.status,
        note: rec.note,
      },
    })
  );

  const results = await db.$transaction(operations);

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.record.batch_upsert",
    entity: "AttendanceSession",
    entityId: sessionId,
    after: { count: results.length },
  });

  return results;
}

export async function deleteSession(tenantId: string, actorId: string, sessionId: string) {
  const existing = await db.attendanceSession.findFirst({
    where: { id: sessionId, tenantId },
  });
  if (!existing) throw new Error("ไม่พบคาบเรียนที่ต้องการลบ");

  await db.attendanceSession.delete({
    where: { id: sessionId },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "attendance.session.delete",
    entity: "AttendanceSession",
    entityId: sessionId,
    before: existing,
  });

  return { success: true };
}
