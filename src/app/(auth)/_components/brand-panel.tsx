"use client";

import { useT } from "@/shared/lib/i18n/client";
import { BrandMarkIcon } from "./icons";
import { useTenantSettings } from "./tenant-settings-context";
import type { TenantSettings } from "@/features/identity";

interface BrandPanelProps {
  tenantSettings?: TenantSettings | null;
}

export function BrandPanel({ tenantSettings: propSettings }: BrandPanelProps) {
  const t = useT();
  const contextSettings = useTenantSettings();
  const settings = propSettings ?? contextSettings;

  const brandName = settings?.nameTh || t("app.name");
  const brandNameEn = settings?.nameEn;

  const logoUrl = settings?.logoUrl || "/uploads/mcu-logo.png";

  return (
    <aside className="brandside">
      <div className="mark">
        <i>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={brandName}
              className="h-full w-full object-contain p-1 rounded-[inherit]"
            />
          ) : (
            <BrandMarkIcon />
          )}
        </i>
        <span>{brandName}</span>
      </div>

      <div className="lead">
        <div className="eyebrow">
          <span>{brandNameEn ? brandNameEn.toUpperCase() : t("auth.brand.eyebrow")}</span>
        </div>
        <h1>{brandName}</h1>
        <p>
          {brandNameEn
            ? `${brandNameEn} — ระบบสารสนเทศและบริการออนไลน์`
            : t("auth.brand.subtitle")}
        </p>
      </div>

      <p className="foot">
        {settings?.nameTh ? `${settings.nameTh} · ${brandNameEn || ""}` : t("app.tagline")}
      </p>
    </aside>
  );
}
