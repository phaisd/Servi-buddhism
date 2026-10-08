import { requirePermission } from "@/features/identity/server";
import { EVENTS_P } from "@/features/events";
import { getEvents } from "@/features/events/server";
import { EventsClient } from "./_components/events-client";

export default async function EventsPage() {
  const ctx = await requirePermission(EVENTS_P.manage);
  const items = await getEvents(ctx.tenantId);

  return <EventsClient initialItems={items} />;
}
