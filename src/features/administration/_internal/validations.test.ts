import { describe, it, expect } from "vitest";
import { adminDocumentSchema } from "./validations";

describe("Administration Validations", () => {
  it("validates document creation", () => {
    const validData = {
      title: "แบบฟอร์มขออนุมัติ",
      fileUrl: "https://example.com/form.pdf",
      category: "FORM",
      visibility: "PUBLIC",
    };
    expect(() => adminDocumentSchema.parse(validData)).not.toThrow();
    expect(() => adminDocumentSchema.parse({ ...validData, fileUrl: "not-a-url" })).toThrow();
  });
});
