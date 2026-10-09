import { describe, it, expect } from "vitest";
import { curriculumSchema, departmentSchema } from "./validations";

describe("Curriculum Validations", () => {
  it("validates curriculum creation", () => {
    const validData = {
      nameTh: "พุทธศาสตรบัณฑิต",
      degree: "BACHELOR",
      durationYears: 4,
      departmentId: "11111111-1111-4111-a111-111111111111",
    };
    expect(() => curriculumSchema.parse(validData)).not.toThrow();
    expect(() => curriculumSchema.parse({ ...validData, nameTh: "" })).toThrow();
  });

  it("validates department creation", () => {
    const validDept = {
      nameTh: "ภาควิชาพระพุทธศาสนา",
      nameEn: "Department of Buddhism",
      code: "BUD",
      type: "DEPARTMENT",
    };
    expect(() => departmentSchema.parse(validDept)).not.toThrow();
    expect(() => departmentSchema.parse({ ...validDept, nameTh: "" })).toThrow();
  });
});
