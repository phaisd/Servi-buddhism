import { requirePermission } from "@/features/identity/server";
import { CERTIFICATES_P } from "@/features/certificates";
import { getCertificateTypes } from "@/features/certificates/server";
import { TypesAdminClient } from "./_components/types-admin-client";

export default async function CertificateTypesAdminPage() {
  const ctx = await requirePermission(CERTIFICATES_P.typeManage);
  const items = await getCertificateTypes(ctx.tenantId);

  return <TypesAdminClient initialItems={items} />;
}
