import { requirePermission } from "@/features/identity/server";
import { CERTIFICATES_P } from "@/features/certificates";
import { getAllCertificateRequests } from "@/features/certificates/server";
import { RequestsAdminClient } from "./_components/requests-admin-client";

export default async function CertificateRequestsAdminPage() {
  const ctx = await requirePermission(CERTIFICATES_P.requestView);
  const items = await getAllCertificateRequests(ctx.tenantId);

  return <RequestsAdminClient initialItems={items} />;
}
