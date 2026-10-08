import { requirePermission } from "@/features/identity/server";
import { EVENTS_P } from "@/features/events";
import { getRegistrations, getEventById } from "@/features/events/server";
import { RegistrationsClient } from "./_components/registrations-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function RegistrationsPage({ params }: PageProps) {
  const { eventId } = await params;
  const ctx = await requirePermission(EVENTS_P.manage);
  
  const event = await getEventById(ctx.tenantId, eventId);
  if (!event) notFound();

  const items = await getRegistrations(ctx.tenantId, eventId);

  return <RegistrationsClient initialItems={items} event={event} />;
}
