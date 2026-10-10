import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "@/features/attendance";
import { getSessions, getClassById } from "@/features/attendance/server";
import { SessionsClient } from "./_components/sessions-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ classId: string }>;
}

export default async function AttendanceSessionsPage({ params }: PageProps) {
  const { classId } = await params;
  const ctx = await requirePermission(ATTENDANCE_P.manage);
  const [items, classItem] = await Promise.all([
    getSessions(ctx.tenantId, classId),
    getClassById(ctx.tenantId, classId),
  ]);

  if (!classItem) {
    notFound();
  }

  return <SessionsClient initialItems={items} classItem={classItem} classId={classId} />;
}
