"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P, type TenantSettings } from "@/features/identity";

interface PortalNavbarProps {
  tenantSettings: TenantSettings | null;
  isLoggedIn?: boolean;
}

export function PortalNavbar({ tenantSettings }: PortalNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { user, status, isAuthenticated, roles, permissions, isSuperAdmin } = useAppSession();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const [prevRoute, setPrevRoute] = React.useState(pathname);

  if (pathname !== prevRoute) {
    setPrevRoute(pathname);
    setMobileMenuOpen(false);
    setServicesOpen(false);
  }

  const brandName =
    locale === "th"
      ? tenantSettings?.nameTh || "คณะพุทธศาสตร์"
      : tenantSettings?.nameEn || "Faculty of Buddhism";
  const brandTagline =
    locale === "th"
      ? "Faculty of Buddhism Web Portal"
      : "Buddhist Studies & Academic Portal";

  // Check active state for news category menu items
  const currentCategory = searchParams.get("category");
  const isNewsBase = pathname === "/portal/news";

  const navItems = [
    {
      label: "ข่าวประชาสัมพันธ์",
      href: "/portal/news",
      active: isNewsBase && !currentCategory,
    },
    {
      label: "วิชาการ",
      href: "/portal/news?category=ACADEMIC",
      active: isNewsBase && currentCategory === "ACADEMIC",
    },
    {
      label: "กิจกรรม",
      href: "/portal/news?category=EVENT",
      active: isNewsBase && currentCategory === "EVENT",
    },
    {
      label: "ศาสนกิจ",
      href: "/portal/news?category=BUDDHIST_AFFAIRS",
      active: isNewsBase && currentCategory === "BUDDHIST_AFFAIRS",
    },
  ];

  const serviceItems = [
    { label: "หลักสูตรการศึกษา", href: "/portal/programs" },
    { label: "ทำเนียบบุคลากร", href: "/portal/personnel" },
    { label: "เอกสารดาวน์โหลด", href: "/portal/documents" },
    { label: "จองห้องประชุม", href: "/portal/meetings" },
    { label: "ขอหนังสือรับรอง", href: "/portal/certificates" },
    { label: "กิจกรรมนิสิต", href: "/portal/events" },
  ];

  const isAnyServiceActive = serviceItems.some((s) => pathname.startsWith(s.href));
  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const ctx = { roles, permissions, isSuperAdmin };
  const canManageSettings = hasPermission(ctx, P.settingsManage);

  // If on the portal homepage, hide the top navbar so the EMBER.dsgn hero has full-screen impact with its own integrated header
  if (pathname === "/portal") {
    return null;
  }

  return (
    <header className="adm-head sticky top-0 z-40 w-full px-4 sm:px-6">
      {/* Brand Block matching Admin */}
      <Link className="brand-blk !w-auto mr-4 hover:opacity-90 transition-opacity" href="/portal">
        <i>
          {tenantSettings?.logoUrl ? (
            <img
              src={tenantSettings.logoUrl}
              alt={brandName}
              className="h-full w-full object-contain p-0.5 rounded-[inherit]"
            />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
          )}
        </i>
        <div className="t">
          <b>{brandName}</b>
          <span>{brandTagline}</span>
        </div>
      </Link>

      {/* Main Desktop Navigation Items */}
      <nav className="hidden lg:flex items-center gap-1.5 ml-2" aria-label="Portal Navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 rounded-[var(--r-md)] text-sm font-medium transition-colors whitespace-nowrap",
              item.active
                ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold shadow-xs"
                : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-strong)]"
            )}
          >
            {item.label}
          </Link>
        ))}

        {/* Dropdown for other Portal Services */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setServicesOpen(!servicesOpen)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-[var(--r-md)] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
              isAnyServiceActive
                ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold shadow-xs"
                : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-strong)]"
            )}
          >
            <span>บริการออนไลน์</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", servicesOpen && "rotate-180")} />
          </button>

          {servicesOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setServicesOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 mt-2 w-52 rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--border)] shadow-lg py-1.5 z-40 backdrop-blur-md">
                {serviceItems.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className={cn(
                      "block px-3.5 py-2 text-sm transition-colors",
                      pathname.startsWith(service.href)
                        ? "bg-[var(--glass-strong)] text-[var(--brand-ink)] font-semibold"
                        : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                    )}
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Flexible Spacer */}
      <span className="sp" />

      {/* Right Controls matching Admin Navbar */}
      <div className="flex items-center gap-2">
        <span className="pill role hidden sm:inline-block">Portal</span>

        {/* Theme Toggle Button matching Admin */}
        <button
          type="button"
          className="icon-btn"
          aria-label={t("nav.themeToggle")}
          title={t("nav.themeToggle")}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
          </svg>
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher className="lang" />

        {/* User Account Avatar Menu (when logged in) or Login Button */}
        {status === "loading" ? (
          <div aria-hidden="true" className="h-8 w-8 animate-pulse rounded-full bg-[var(--glass-strong)] ml-1" />
        ) : isAuthenticated && user ? (
          <div className="acct ml-1">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <button type="button" aria-label="Account menu">
                  <span className="who" aria-hidden="true">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="nm hidden md:inline">{user.name}</span>
                  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </DropdownMenuPrimitive.Trigger>

              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  className="menu-list"
                  align="end"
                  sideOffset={8}
                  style={{ position: "static" }}
                >
                  <DropdownMenuPrimitive.Label asChild>
                    <div className="px-3 py-2 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </DropdownMenuPrimitive.Label>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 opacity-80" />
                      <span>ระบบบริหารจัดการ (Dashboard)</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link href="/me" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer">
                      <User className="h-4 w-4 opacity-80" />
                      <span>{t("account.profile")}</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  {canManageSettings && (
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer">
                        <SettingsIcon className="h-4 w-4 opacity-80" />
                        <span>{t("nav.settings")}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                  )}

                  <DropdownMenuPrimitive.Separator asChild>
                    <hr className="my-1 border-[var(--border)]" />
                  </DropdownMenuPrimitive.Separator>

                  <DropdownMenuPrimitive.Item asChild>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/portal" })}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("account.logout")}</span>
                    </button>
                  </DropdownMenuPrimitive.Item>
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          </div>
        ) : (
          <div className="acct ml-1">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <button type="button" aria-label="Staff Console menu" className="cursor-pointer">
                  <span className="who" aria-hidden="true">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="nm hidden sm:inline">Staff Console</span>
                  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </DropdownMenuPrimitive.Trigger>

              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  className="menu-list"
                  align="end"
                  sideOffset={8}
                  style={{ position: "static" }}
                >
                  <DropdownMenuPrimitive.Label asChild>
                    <div className="px-3 py-2 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text)]">Staff Console</p>
                      <p className="text-xs text-[var(--text-muted)]">ระบบสำหรับบุคลากรและเจ้าหน้าที่</p>
                    </div>
                  </DropdownMenuPrimitive.Label>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer"
                    >
                      <LogIn className="h-4 w-4 opacity-80" />
                      <span>เข้าสู่ระบบเจ้าหน้าที่ (Sign In)</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>

                  <DropdownMenuPrimitive.Item asChild>
                    <Link
                      href="/forgot-password"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 opacity-80" />
                      <span>ลืมรหัสผ่าน (Forgot Password)</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          </div>
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="icon-btn lg:hidden ml-1"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-[var(--adm-head-h,64px)] left-0 right-0 bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)] shadow-xl p-4 lg:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            {/* User profile card on mobile if logged in */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-2.5 bg-[var(--glass-strong)] rounded-[var(--r-md)] mb-2 border border-[var(--border)]">
                <span className="who w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--brand)] text-[var(--on-brand)] shrink-0 overflow-hidden">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] truncate">{user.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-3 p-2.5 bg-[var(--glass-strong)] hover:bg-[var(--glass-hover)] rounded-[var(--r-md)] mb-2 border border-[var(--border)] transition-colors"
              >
                <span className="who w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--brand)] text-[var(--on-brand)] shrink-0">
                  <User className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)]">Staff Console</p>
                  <p className="text-[11px] text-[var(--text-muted)]">เข้าสู่ระบบสำหรับบุคลากร</p>
                </div>
                <LogIn className="h-4 w-4 text-[var(--text-muted)]" />
              </Link>
            )}

            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
              ข่าวสาร & สื่อ
            </span>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-[var(--r-md)] text-sm font-medium transition-colors",
                  item.active
                    ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold"
                    : "text-[var(--text-2)] hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-[var(--border)]" />
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
              บริการออนไลน์
            </span>
            {serviceItems.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className={cn(
                  "px-3 py-2 rounded-[var(--r-md)] text-sm font-medium transition-colors",
                  pathname.startsWith(service.href)
                    ? "bg-[var(--brand)] text-[var(--on-brand)] font-semibold"
                    : "text-[var(--text-2)] hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                )}
              >
                {service.label}
              </Link>
            ))}

            <div className="my-2 border-t border-[var(--border)]" />
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-[var(--text-2)] hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>ระบบบริหารจัดการ (Dashboard)</span>
                </Link>
                <Link
                  href="/me"
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-[var(--text-2)] hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                >
                  <User className="h-4 w-4" />
                  <span>โปรไฟล์ของฉัน</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/portal" })}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--r-md)] text-sm font-medium bg-[var(--brand)] text-[var(--on-brand)]"
              >
                <LogIn className="h-4 w-4" />
                <span>เข้าสู่ระบบหลังบ้าน</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
