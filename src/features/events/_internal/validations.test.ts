import { describe, it, expect } from "vitest";
import { eventSchema } from "./validations";

describe("Events Validations", () => {
  it("validates event creation", () => {
    expect(() => eventSchema.parse({
      title: "Annual Sports Day",
      startDate: new Date("2025-10-10T09:00:00Z"),
      endDate: new Date("2025-10-10T16:00:00Z"),
      capacity: 100,
    })).not.toThrow();
  });

  it("rejects event if endDate is before startDate", () => {
    expect(() => eventSchema.parse({
      title: "Annual Sports Day",
      startDate: new Date("2025-10-10T16:00:00Z"),
      endDate: new Date("2025-10-10T09:00:00Z"),
      capacity: 100,
    })).toThrow();
  });
});
