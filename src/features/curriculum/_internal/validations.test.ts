import { describe, it, expect } from "vitest";
import { curriculumSchema } from "./validations";

describe("Curriculum Validations", () => {
  it("validates curriculum creation", () => {
    const validData = {
      nameTh: "พุทธศาสตรบัณฑิต",
      degree: "BACHELOR",
      durationYears: 4,
    };
    expect(() => curriculumSchema.parse(validData)).not.toThrow();
    expect(() => curriculumSchema.parse({ ...validData, nameTh: "" })).toThrow();
  });
});
