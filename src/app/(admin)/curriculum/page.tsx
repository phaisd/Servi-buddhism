import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { getCurriculums } from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-admin-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.read);
  const items = await getCurriculums(ctx.tenantId);

  return <CurriculumAdminClient initialItems={items} />;
}
