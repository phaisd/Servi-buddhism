import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "@/features/personnel";
import { getDepartments } from "@/features/personnel/server";
import { DepartmentsAdminClient } from "./_components/departments-admin-client";

export default async function DepartmentsAdminPage() {
  const ctx = await requirePermission(PERSONNEL_P.manage);
  const items = await getDepartments(ctx.tenantId);

  return <DepartmentsAdminClient initialItems={items} />;
}
