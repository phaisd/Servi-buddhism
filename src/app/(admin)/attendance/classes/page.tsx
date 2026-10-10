import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "@/features/attendance";
import { getClasses } from "@/features/attendance/server";
import { getCurriculums } from "@/features/curriculum/server";
import { ClassesClient } from "./_components/classes-client";

export default async function AttendanceClassesPage() {
  const ctx = await requirePermission(ATTENDANCE_P.manage);
  const [items, curriculums] = await Promise.all([
    getClasses(ctx.tenantId, ctx.userId),
    getCurriculums(ctx.tenantId),
  ]);

  return <ClassesClient initialItems={items} curriculums={curriculums} />;
}
