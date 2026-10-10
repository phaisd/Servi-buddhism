import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { getCurriculums, getDepartments } from "@/features/curriculum/server";
import { TimetablesAdminClient } from "./_components/timetables-admin-client";

export default async function CurriculumTimetablesPage() {
  const ctx = await requirePermission(CURRICULUM_P.read);
  const [curriculums, departments] = await Promise.all([
    getCurriculums(ctx.tenantId),
    getDepartments(ctx.tenantId),
  ]);

  return <TimetablesAdminClient curriculums={curriculums} departments={departments} />;
}
