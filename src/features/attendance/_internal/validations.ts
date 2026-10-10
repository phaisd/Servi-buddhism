import { z } from "zod";

export const attendanceStudentSchema = z.object({
  studentCode: z.string().min(1, "กรุณากรอกรหัสนิสิต").max(50),
  studentName: z.string().min(1, "กรุณากรอกชื่อ-ฉายา/นามสกุล").max(255),
  yearLevel: z.number().int().min(1).max(8).optional().nullable(),
  major: z.string().max(255).optional().nullable(),
});

export const attendanceClassSchema = z.object({
  courseCode: z.string().min(1, "Required").max(50),
  courseName: z.string().min(1, "Required").max(255),
  term: z.string().min(1, "Required").max(50),
  isActive: z.boolean().default(true),
  instructorName: z.string().optional().nullable(),
  students: z.array(attendanceStudentSchema).optional(),
});
export const updateAttendanceClassSchema = attendanceClassSchema.partial();

export const attendanceSessionSchema = z.object({
  classId: z.string().uuid(),
  date: z.coerce.date(),
  topic: z.string().optional().nullable(),
});

export const attendanceRecordSchema = z.object({
  sessionId: z.string().uuid(),
  studentCode: z.string().min(1).max(50),
  studentName: z.string().min(1).max(255),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  note: z.string().optional().nullable(),
});

export const batchSaveRecordsSchema = z.object({
  sessionId: z.string().uuid(),
  records: z.array(
    z.object({
      studentCode: z.string().min(1),
      studentName: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      note: z.string().optional().nullable(),
    })
  ),
});
