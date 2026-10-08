import { requirePermission } from "@/features/identity/server";
import { MEETINGS_P } from "@/features/meetings";
import { getMeetingRooms } from "@/features/meetings/server";
import { MeetingRoomsClient } from "./_components/meeting-rooms-client";

export default async function MeetingRoomsPage() {
  const ctx = await requirePermission(MEETINGS_P.manage);
  const items = await getMeetingRooms(ctx.tenantId);

  return <MeetingRoomsClient initialItems={items} />;
}
