"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/shared/lib/i18n/client";
import { BrandMarkIcon } from "../../_components/icons";
import { useTenantSettings } from "../../_components/tenant-settings-context";
import { PasswordLoginForm } from "./password-login-form";
import { OAuthButtons } from "./oauth-buttons";
import type { TenantSettings } from "@/features/identity";

interface LoginPanelProps {
  providers: ("google" | "microsoft")[];
  tenantSettings?: TenantSettings | null;
}

export function LoginPanel({ providers, tenantSettings: propSettings }: LoginPanelProps) {
  const t = useT();
  const error = useSearchParams().get("error");
  const contextSettings = useTenantSettings();
  const settings = propSettings ?? contextSettings;

  const brandName = settings?.nameTh || t("app.name");
  const brandNameEn = settings?.nameEn;

  return (
    <div className="auth-box">
      <div className="auth-mark">
        <i>
          {settings?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={brandName}
              className="h-full w-full object-contain p-1.5 rounded-[inherit]"
            />
          ) : (
            <BrandMarkIcon />
          )}
        </i>
        <div>
          <h1>{brandName}</h1>
          {brandNameEn && <p className="text-xs text-muted-foreground mt-0.5">{brandNameEn}</p>}
        </div>
      </div>

      <div className="auth-head">
        <h2>{t("auth.welcome")}</h2>
        <p>{t("auth.login.subtitle")}</p>
      </div>

      {error === "NoAccount" && <p className="err" role="alert">{t("auth.oauthNoAccount")}</p>}

      <PasswordLoginForm />

      <div className="auth-foot">
        <p><Link href="/forgot-password">{t("auth.forgot")}</Link></p>
      </div>

      {providers.length > 0 && (
        <>
          <div className="or"><span>{t("auth.orContinueWith")}</span></div>
          <OAuthButtons providers={providers} />
        </>
      )}
    </div>
  );
}
