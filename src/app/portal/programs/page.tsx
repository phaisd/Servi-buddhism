import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicCurriculums, getDepartments } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { ProgramsPortalClient } from "./_components/programs-portal-client";

export default async function PublicCurriculumPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [items, departments] = await Promise.all([
    getPublicCurriculums(tenantId),
    getDepartments(tenantId),
  ]);

  return <ProgramsPortalClient items={items} departments={departments} locale={locale} />;
}
