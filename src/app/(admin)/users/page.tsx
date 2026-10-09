import { requirePermission, hasPermission, P } from "@/features/identity/server";
import { UsersClient } from "./_components/users-client";

export default async function UsersPage(props: { searchParams?: Promise<{ roleId?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const ctx = await requirePermission(P.usersRead);
  return (
    <UsersClient
      canManage={hasPermission(ctx, P.usersManage)}
      selfId={ctx.userId}
      initialRoleId={searchParams?.roleId}
    />
  );
}
