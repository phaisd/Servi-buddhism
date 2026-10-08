import { resolvePublicTenantId } from "@/features/news/server";
import { getActiveCertificateTypes } from "@/features/certificates/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { auth } from "@/features/identity/server";
import { redirect } from "next/navigation";
import { RequestFormClient } from "./_components/request-form-client";

export default async function CertificateRequestPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login?callbackUrl=/portal/certificates/request");
  }

  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();
  
  const types = await getActiveCertificateTypes(tenantId);

  return <RequestFormClient types={types} locale={locale} />;
}
