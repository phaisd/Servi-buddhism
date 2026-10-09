"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";

export function UsersNav() {
  const pathname = usePathname();
  const t = useT();

  const isUsers = pathname === "/users";
  const isRoles = pathname === "/users/roles";

  return (
    <div className="flex items-center gap-2 border-b border-[var(--glass-border)] px-4 sm:px-6 mb-6">
      <Link
        href="/users"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition-all -mb-[1px]",
          isUsers
            ? "border-[var(--brand)] text-[var(--brand)] font-semibold"
            : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
        )}
      >
        <Users className="w-4 h-4" />
        <span>{t("nav.users")}</span>
      </Link>
      <Link
        href="/users/roles"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition-all -mb-[1px]",
          isRoles
            ? "border-[var(--brand)] text-[var(--brand)] font-semibold"
            : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
        )}
      >
        <Shield className="w-4 h-4" />
        <span>{t("nav.roles")}</span>
      </Link>
    </div>
  );
}
