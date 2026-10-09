import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { getCurriculums, getDepartments } from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-admin-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.read);
  const [items, departments] = await Promise.all([
    getCurriculums(ctx.tenantId),
    getDepartments(ctx.tenantId),
  ]);

  return <CurriculumAdminClient initialItems={items} departments={departments} />;
}
