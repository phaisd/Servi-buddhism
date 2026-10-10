import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicCurriculums, getDepartments } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { AllTimetablesPortalClient } from "./_components/all-timetables-portal-client";

export default async function PublicTimetablesPage() {
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [curriculums, departments] = await Promise.all([
    getPublicCurriculums(tenantId),
    getDepartments(tenantId),
  ]);

  return (
    <AllTimetablesPortalClient
      curriculums={curriculums}
      departments={departments}
      locale={locale}
    />
  );
}
