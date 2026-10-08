import { requirePermission } from "@/features/identity/server";
import { MEETINGS_P } from "@/features/meetings";
import { getBookings } from "@/features/meetings/server";
import { BookingsClient } from "./_components/bookings-client";

export default async function BookingsPage() {
  const ctx = await requirePermission(MEETINGS_P.manage);
  const items = await getBookings(ctx.tenantId);

  return <BookingsClient initialItems={items} />;
}
