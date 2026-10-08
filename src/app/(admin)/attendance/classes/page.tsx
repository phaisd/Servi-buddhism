import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "@/features/attendance";
import { getClasses } from "@/features/attendance/server";
import { ClassesClient } from "./_components/classes-client";

export default async function AttendanceClassesPage() {
  const ctx = await requirePermission(ATTENDANCE_P.manage);
  const items = await getClasses(ctx.tenantId, ctx.userId);

  return <ClassesClient initialItems={items} />;
}
