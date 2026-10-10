import { notFound } from "next/navigation";
import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicCurriculumById } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { TimetablePortalClient } from "./_components/timetable-portal-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramTimetablePage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const curriculum = await getPublicCurriculumById(tenantId, id);
  if (!curriculum) {
    notFound();
  }

  return <TimetablePortalClient curriculum={curriculum} locale={locale} />;
}
