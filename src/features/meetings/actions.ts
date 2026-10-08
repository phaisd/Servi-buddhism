"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { MEETINGS_P } from "./permissions";
import {
  createMeetingRoom,
  updateMeetingRoom,
  deleteMeetingRoom,
  createBooking,
  updateBookingStatus,
} from "./_internal/services";
import {
  meetingRoomSchema,
  updateMeetingRoomSchema,
  meetingBookingSchema,
} from "./_internal/validations";
import type { BookingStatus } from "@/generated/prisma";

// Room Actions
export async function createMeetingRoomAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(MEETINGS_P.manage);
  const parsed = meetingRoomSchema.parse(data);
  return createMeetingRoom(session.tenantId, session.userId, parsed);
}

export async function updateMeetingRoomAction(id: string, data: unknown) {
  const session = await requireSession();
  await requirePermission(MEETINGS_P.manage);
  const parsed = updateMeetingRoomSchema.parse(data);
  return updateMeetingRoom(session.tenantId, session.userId, id, parsed);
}

export async function deleteMeetingRoomAction(id: string) {
  const session = await requireSession();
  await requirePermission(MEETINGS_P.manage);
  return deleteMeetingRoom(session.tenantId, session.userId, id);
}

// Booking Actions
export async function createBookingAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(MEETINGS_P.book);
  const parsed = meetingBookingSchema.parse(data);
  return createBooking(session.tenantId, session.userId, parsed);
}

export async function updateBookingStatusAction(id: string, status: BookingStatus) {
  const session = await requireSession();
  await requirePermission(MEETINGS_P.manage);
  return updateBookingStatus(session.tenantId, session.userId, id, status);
}
