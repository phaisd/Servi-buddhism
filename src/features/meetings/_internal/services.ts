import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { BookingStatus } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

export async function getMeetingRooms(tenantId: string) {
  return db.meetingRoom.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
}

export async function getPublicMeetingRooms(tenantId: string) {
  return db.meetingRoom.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createMeetingRoom(
  tenantId: string,
  actorId: string,
  data: Omit<Prisma.MeetingRoomCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "bookings">
) {
  const result = await db.meetingRoom.create({
    data: {
      tenantId,
      ...data,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "meetings.room.create",
    entity: "MeetingRoom",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateMeetingRoom(
  tenantId: string,
  actorId: string,
  id: string,
  data: Partial<Omit<Prisma.MeetingRoomCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "bookings">>
) {
  const before = await db.meetingRoom.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.meetingRoom.update({
    where: { id, tenantId },
    data,
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "meetings.room.update",
    entity: "MeetingRoom",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}

export async function deleteMeetingRoom(tenantId: string, actorId: string, id: string) {
  const before = await db.meetingRoom.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  await db.meetingRoom.delete({ where: { id, tenantId } });

  await writeAudit({
    tenantId,
    actorId,
    action: "meetings.room.delete",
    entity: "MeetingRoom",
    entityId: id,
    before,
  });
  return true;
}

// -------------------------------------------------------------
// Bookings
// -------------------------------------------------------------

export async function getBookings(tenantId: string, filters?: { roomId?: string; status?: BookingStatus }) {
  const where: Prisma.MeetingBookingWhereInput = { tenantId };
  if (filters?.roomId) where.roomId = filters.roomId;
  if (filters?.status) where.status = filters.status;

  return db.meetingBooking.findMany({
    where,
    include: { room: true, requester: true },
    orderBy: { startTime: "desc" },
  });
}

export async function getUpcomingBookings(tenantId: string) {
  return db.meetingBooking.findMany({
    where: { 
      tenantId,
      status: "APPROVED",
      startTime: { gte: new Date() }
    },
    include: { room: true, requester: true },
    orderBy: { startTime: "asc" },
  });
}

export async function createBooking(
  tenantId: string,
  requesterId: string,
  data: {
    roomId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    remark?: string | null;
  }
) {
  // Check overlap (approved or pending)
  const overlapping = await db.meetingBooking.findFirst({
    where: {
      tenantId,
      roomId: data.roomId,
      status: { in: ["APPROVED", "PENDING"] },
      OR: [
        { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } }
      ]
    }
  });

  if (overlapping) {
    throw new Error("Room is already booked during this time");
  }

  const result = await db.meetingBooking.create({
    data: {
      tenantId,
      requesterId,
      roomId: data.roomId,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      remark: data.remark,
      status: "PENDING",
    },
  });

  await writeAudit({
    tenantId,
    actorId: requesterId,
    action: "meetings.booking.create",
    entity: "MeetingBooking",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateBookingStatus(
  tenantId: string,
  actorId: string,
  id: string,
  status: BookingStatus
) {
  const before = await db.meetingBooking.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.meetingBooking.update({
    where: { id, tenantId },
    data: { status },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: `meetings.booking.status_change`,
    entity: "MeetingBooking",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}
