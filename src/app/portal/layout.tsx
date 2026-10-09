import { resolveTenantSettings, auth } from "@/features/identity/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([
    resolveTenantSettings(),
    auth().catch(() => null),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar matching Admin */}
      <PortalNavbar
        tenantSettings={settings}
        isLoggedIn={!!session?.user?.id}
      />

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Liyon-Themed Footer */}
      <PortalFooter />
    </div>
  );
}
