"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BrandPanel } from "./brand-panel";
import { TenantSettingsContext } from "./tenant-settings-context";
import type { TenantSettings } from "@/features/identity";

interface AuthLayoutClientProps {
  tenantSettings: TenantSettings | null;
  children: React.ReactNode;
}

/**
 * /login = สองคอลัมน์มีแผ่นแบรนด์ (.auth-split)
 * หน้าอื่น = การ์ดเดี่ยวกลางจอ (.auth-solo)
 * พร้อมส่งต่อข้อมูล tenantSettings (โลโก้ และข้อมูลองค์กร) ผ่าน Context
 */
export function AuthLayoutClient({ tenantSettings, children }: AuthLayoutClientProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <TenantSettingsContext.Provider value={tenantSettings}>
      {isLogin ? (
        <div className="auth auth-split">
          <BrandPanel tenantSettings={tenantSettings} />
          <main className="auth-main">{children}</main>
        </div>
      ) : (
        <div className="auth auth-solo">{children}</div>
      )}
    </TenantSettingsContext.Provider>
  );
}
