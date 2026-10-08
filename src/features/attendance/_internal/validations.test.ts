import { describe, it, expect } from "vitest";
import { attendanceClassSchema, attendanceRecordSchema } from "./validations";

describe("Attendance Validations", () => {
  it("validates class creation", () => {
    expect(() => attendanceClassSchema.parse({
      courseCode: "BUD101",
      courseName: "Introduction to Buddhism",
      term: "1/2569"
    })).not.toThrow();
  });

  it("validates record creation", () => {
    expect(() => attendanceRecordSchema.parse({
      sessionId: "00000000-0000-0000-0000-000000000000",
      studentCode: "660001",
      studentName: "John Doe",
      status: "PRESENT",
    })).not.toThrow();

    expect(() => attendanceRecordSchema.parse({
      sessionId: "00000000-0000-0000-0000-000000000000",
      studentCode: "660001",
      studentName: "John Doe",
      status: "INVALID_STATUS",
    })).toThrow();
  });
});
