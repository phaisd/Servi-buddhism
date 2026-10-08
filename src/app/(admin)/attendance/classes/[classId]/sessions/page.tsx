import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "@/features/attendance";
import { getSessions } from "@/features/attendance/server";
import { SessionsClient } from "./_components/sessions-client";

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function AttendanceSessionsPage({ params }: PageProps) {
  const { classId } = await params;
  const ctx = await requirePermission(ATTENDANCE_P.manage);
  const items = await getSessions(ctx.tenantId, classId);

  return <SessionsClient initialItems={items} classId={classId} />;
}
