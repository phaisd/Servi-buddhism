import { resolveTenantSettings } from "@/features/identity/server";
import { AuthLayoutClient } from "./_components/auth-layout-client";

/** /login = สองคอลัมน์มีแผ่นแบรนด์ (`.auth-split`) · หน้าอื่น = การ์ดเดี่ยวกลางจอ (`.auth-solo`) ตาม liyon-auth.css */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const tenantSettings = await resolveTenantSettings();

  return (
    <AuthLayoutClient tenantSettings={tenantSettings}>
      {children}
    </AuthLayoutClient>
  );
}
