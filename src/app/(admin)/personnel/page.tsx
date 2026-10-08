import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "@/features/personnel";
import { getPersonnelList } from "@/features/personnel/server";
import { PersonnelAdminClient } from "./_components/personnel-admin-client";

export default async function PersonnelAdminPage() {
  const ctx = await requirePermission(PERSONNEL_P.read);
  const items = await getPersonnelList(ctx.tenantId);

  return <PersonnelAdminClient initialItems={items} />;
}
