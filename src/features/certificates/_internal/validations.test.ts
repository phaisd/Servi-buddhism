import { describe, it, expect } from "vitest";
import { reviewCertificateRequestSchema } from "./validations";

describe("Certificate Validations", () => {
  it("allows REJECTED with reason", () => {
    const data = { status: "REJECTED", reason: "Invalid document" };
    expect(() => reviewCertificateRequestSchema.parse(data)).not.toThrow();
  });

  it("fails REJECTED without reason", () => {
    const data = { status: "REJECTED" };
    expect(() => reviewCertificateRequestSchema.parse(data)).toThrow();
  });

  it("allows APPROVED without reason", () => {
    const data = { status: "APPROVED" };
    expect(() => reviewCertificateRequestSchema.parse(data)).not.toThrow();
  });
});
