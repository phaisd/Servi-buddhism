import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { getDepartments } from "@/features/curriculum/server";
import { DepartmentsAdminClient } from "./_components/departments-admin-client";

export default async function CurriculumDepartmentsPage() {
  const ctx = await requirePermission(CURRICULUM_P.read);
  const items = await getDepartments(ctx.tenantId);

  return <DepartmentsAdminClient initialItems={items} />;
}
