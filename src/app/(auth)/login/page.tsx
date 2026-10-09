import { oauthProviderIds, resolveTenantSettings } from "@/features/identity/server";
import { LoginPanel } from "./_components/login-panel";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await resolveTenantSettings();
  return <LoginPanel providers={oauthProviderIds()} tenantSettings={settings} />;
}
