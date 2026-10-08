import { describe, it, expect } from "vitest";
import { departmentSchema, personnelSchema } from "./validations";

describe("Personnel Validations", () => {
  it("validates department creation", () => {
    expect(() => departmentSchema.parse({ nameTh: "ภาควิชาพระพุทธศาสนา" })).not.toThrow();
    expect(() => departmentSchema.parse({ nameTh: "" })).toThrow();
  });

  it("validates personnel creation", () => {
    const validData = {
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      positionTh: "อาจารย์ประจำ",
      type: "ACADEMIC",
    };
    expect(() => personnelSchema.parse(validData)).not.toThrow();
    expect(() => personnelSchema.parse({ ...validData, type: "INVALID" })).toThrow();
  });
});
