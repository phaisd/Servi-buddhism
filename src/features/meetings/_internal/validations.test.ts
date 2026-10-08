import { describe, it, expect } from "vitest";
import { meetingRoomSchema, meetingBookingSchema } from "./validations";

describe("Meetings Validations", () => {
  it("validates room creation", () => {
    expect(() => meetingRoomSchema.parse({ name: "Room A", capacity: 20 })).not.toThrow();
    expect(() => meetingRoomSchema.parse({ name: "", capacity: 20 })).toThrow();
  });

  it("validates booking creation with correct times", () => {
    const validData = {
      roomId: "00000000-0000-0000-0000-000000000000",
      title: "Team Sync",
      startTime: new Date("2025-01-01T10:00:00Z"),
      endTime: new Date("2025-01-01T11:00:00Z"),
    };
    expect(() => meetingBookingSchema.parse(validData)).not.toThrow();
  });

  it("rejects booking if endTime is before startTime", () => {
    const invalidData = {
      roomId: "00000000-0000-0000-0000-000000000000",
      title: "Team Sync",
      startTime: new Date("2025-01-01T11:00:00Z"),
      endTime: new Date("2025-01-01T10:00:00Z"),
    };
    expect(() => meetingBookingSchema.parse(invalidData)).toThrow();
  });
});
