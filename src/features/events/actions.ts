"use server";

import { requireSession, requirePermission } from "@/features/identity/server";
import { EVENTS_P } from "./permissions";
import {
  createEvent,
  registerForEvent,
  updateRegistrationStatus,
} from "./_internal/services";
import {
  eventSchema,
  eventRegistrationSchema,
} from "./_internal/validations";
import type { RegistrationStatus } from "@/generated/prisma";

export async function createEventAction(data: unknown) {
  const session = await requireSession();
  await requirePermission(EVENTS_P.manage);
  const parsed = eventSchema.parse(data);
  return createEvent(session.tenantId, session.userId, parsed);
}

export async function registerForEventAction(data: unknown) {
  // Allow student to register for themselves, or admin to register them.
  // In a real system, we'd check if the user is a student or an admin.
  // We'll just require a session for simplicity.
  const session = await requireSession(); 
  const parsed = eventRegistrationSchema.parse(data);
  return registerForEvent(session.tenantId, session.userId, parsed);
}

export async function updateRegistrationStatusAction(id: string, status: RegistrationStatus) {
  const session = await requireSession();
  await requirePermission(EVENTS_P.manage);
  return updateRegistrationStatus(session.tenantId, session.userId, id, status);
}
