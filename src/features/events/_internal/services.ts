import "server-only";
import { prisma as db } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import { RegistrationStatus } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";

export async function getEvents(tenantId: string) {
  return db.event.findMany({
    where: { tenantId },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
}

export async function getPublicEvents(tenantId: string) {
  return db.event.findMany({
    where: { tenantId, isActive: true },
    orderBy: { startDate: "asc" },
  });
}

export async function getEventById(tenantId: string, id: string) {
  return db.event.findUnique({
    where: { id, tenantId },
    include: { _count: { select: { registrations: true } } },
  });
}

export async function createEvent(
  tenantId: string,
  actorId: string,
  data: Omit<Prisma.EventCreateInput, "tenant" | "id" | "createdAt" | "updatedAt" | "registrations">
) {
  const result = await db.event.create({
    data: {
      tenantId,
      ...data,
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "events.event.create",
    entity: "Event",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function getRegistrations(tenantId: string, eventId: string) {
  return db.eventRegistration.findMany({
    where: { tenantId, eventId },
    orderBy: { createdAt: "desc" },
  });
}

export async function registerForEvent(
  tenantId: string,
  actorId: string | null, // null if public registration (though usually need login, but kept flexible)
  data: {
    eventId: string;
    studentCode: string;
    studentName: string;
  }
) {
  // Check capacity
  const event = await db.event.findUnique({
    where: { id: data.eventId, tenantId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) throw new Error("Event not found");

  if (event.capacity > 0 && event._count.registrations >= event.capacity) {
    throw new Error("Event is full");
  }

  // Check existing
  const existing = await db.eventRegistration.findUnique({
    where: {
      eventId_studentCode: {
        eventId: data.eventId,
        studentCode: data.studentCode,
      }
    }
  });

  if (existing) {
    throw new Error("Already registered");
  }

  const result = await db.eventRegistration.create({
    data: {
      tenantId,
      eventId: data.eventId,
      studentCode: data.studentCode,
      studentName: data.studentName,
      status: "REGISTERED",
    },
  });

  await writeAudit({
    tenantId,
    actorId: actorId || "SYSTEM",
    action: "events.registration.create",
    entity: "EventRegistration",
    entityId: result.id,
    after: result,
  });

  return result;
}

export async function updateRegistrationStatus(
  tenantId: string,
  actorId: string,
  id: string,
  status: RegistrationStatus
) {
  const before = await db.eventRegistration.findUnique({ where: { id, tenantId } });
  if (!before) throw new Error("Not found");

  const result = await db.eventRegistration.update({
    where: { id, tenantId },
    data: { status },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: `events.registration.status_change`,
    entity: "EventRegistration",
    entityId: result.id,
    before,
    after: result,
  });

  return result;
}
