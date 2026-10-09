"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Sparkles,
  User,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useAppSession } from "@/hooks/use-session";
import { useTheme } from "next-themes";
import { DEFAULT_HERO_SETTINGS, type TenantSettings, type HeroSettings } from "@/features/identity";

interface PortalHeroProps {
  tenantSettings?: TenantSettings | null;
  locale?: string;
}

export function PortalHero({ tenantSettings, locale = "th" }: PortalHeroProps) {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isSuperAdmin } = useAppSession();
  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const [activeTab, setActiveTab] = React.useState<"TH" | "EN">(locale === "th" ? "TH" : "EN");

  const hero: HeroSettings = React.useMemo(() => {
    return tenantSettings?.hero ?? DEFAULT_HERO_SETTINGS;
  }, [tenantSettings?.hero]);

  // Background photo blend levels: 0.25 (subtle), 0.60 (vivid), 0.0 (minimal/studio only)
  const defaultBg =
    hero.bgModeDefault === "vivid" || hero.bgModeDefault === "minimal"
      ? hero.bgModeDefault
      : "subtle";
  const [userBgMode, setUserBgMode] = React.useState<"subtle" | "vivid" | "minimal" | null>(null);
  const bgMode = userBgMode ?? defaultBg;

  if (hero.enabled === false) {
    return null;
  }

  const brandName =
    activeTab === "TH"
      ? tenantSettings?.nameTh || "คณะพุทธศาสตร์ มจร"
      : tenantSettings?.nameEn || "Faculty of Buddhism";

  const displayBrandText =
    hero.header?.customBrandText?.trim() || brandName;

  const cycleBgMode = () => {
    setUserBgMode((prev) => {
      const current = prev ?? defaultBg;
      if (current === "subtle") return "vivid";
      if (current === "vivid") return "minimal";
      return "subtle";
    });
  };

  const bgOpacityClass =
    bgMode === "vivid"
      ? "opacity-60"
      : bgMode === "subtle"
      ? "opacity-25"
      : "opacity-0";

  const heightClass =
    hero.heightMode === "full"
      ? "min-h-screen"
      : hero.heightMode === "compact"
      ? "min-h-[70vh] lg:min-h-[82vh]"
      : "min-h-[92vh] xl:min-h-screen";

  const bgImageUrl = hero.bgImageUrl?.trim() || "/buddhist-hero-bg.jpg";
  const showBgLayer = hero.bgModeDefault !== "hidden";

  const headerSettings = hero.header ?? DEFAULT_HERO_SETTINGS.header;
  const topTypo = hero.topTypography ?? DEFAULT_HERO_SETTINGS.topTypography;
  const manifesto = hero.manifesto ?? DEFAULT_HERO_SETTINGS.manifesto;
  const watermark = hero.bottomWatermark ?? DEFAULT_HERO_SETTINGS.bottomWatermark;
  const footerSettings = hero.footerRail ?? DEFAULT_HERO_SETTINGS.footerRail;

  return (
    <section className={`relative w-full ${heightClass} bg-gradient-to-r from-[#b7bbc2] via-[#ced1d7] to-[#dadde2] text-[#111317] overflow-hidden select-none font-sans flex flex-col justify-between`}>
      
      {/* ══════════════════════════════════════════════════════════════
          BACKGROUND COMPONENT LAYER (User's Photo: Faculty Landmark)
          - Blended smoothly into the studio atmosphere
          - Allows user to toggle intensity (Subtle / Vivid / Minimal)
         ══════════════════════════════════════════════════════════════ */}
      {showBgLayer && (
        <>
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none mix-blend-overlay ${bgOpacityClass}`}
            style={{
              backgroundImage: `url('${bgImageUrl}')`,
              filter: "saturate(1.2) contrast(1.1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none mix-blend-multiply ${
              bgMode === "minimal" ? "opacity-0" : "opacity-15"
            }`}
            style={{
              backgroundImage: `url('${bgImageUrl}')`,
            }}
          />
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC 3D MOTION ARTWORK (Exact EMBER.dsgn Animation Loop)
          30 FPS buttery smooth animation from MotionSites AI
         ══════════════════════════════════════════════════════════════ */}
      {hero.showMotionArtwork && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
          <picture className="w-full h-full flex items-center justify-center">
            <source
              srcSet={hero.motionArtworkUrl?.trim() || "/ember_animation_30fps.webp"}
              type="image/webp"
            />
            <img
              src={hero.motionPreviewUrl?.trim() || "/ember_preview.gif"}
              alt="EMBER.dsgn 3D Creative Designer Motion"
              className="w-full h-full object-cover lg:object-contain object-center scale-[1.01] transition-transform duration-700"
            />
          </picture>
          {/* Soft edge feathering so the animation seamlessly melds with full-bleed viewports */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#b7bbc2] to-transparent pointer-events-none hidden xl:block" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#dadde2] to-transparent pointer-events-none hidden xl:block" />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TOP NAVIGATION BAR (Exact EMBER.dsgn Header layout)
          Sharp, interactive, functional links over the video artwork
         ══════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full px-6 sm:px-12 pt-7 flex items-center justify-between text-xs tracking-wider">
        {/* Top-Left: Logo & Brand Symbol */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            {headerSettings.showLogo && (
              tenantSettings?.logoUrl ? (
                <div className="h-8 w-8 rounded-lg bg-white/95 p-1 shadow-xs border border-black/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tenantSettings.logoUrl}
                    alt={displayBrandText}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                /* 4-block orange logo grid icon fallback from EMBER.dsgn */
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90">
                  <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
                  <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
                  <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
                  <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
                </div>
              )
            )}
            {headerSettings.showBrandText && (
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#16181d] uppercase transition-colors group-hover:text-black">
                {displayBrandText}
              </span>
            )}
          </Link>

          {/* Navigation Items with dot prefixes (Exact EMBER.dsgn style) */}
          {headerSettings.navLinks && headerSettings.navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-7 text-[11px] font-semibold tracking-widest text-[#444a54] uppercase">
              {headerSettings.navLinks
                .filter((link) => link.enabled !== false)
                .map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="hover:text-black transition-colors flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-black/5"
                  >
                    <span className="text-[#ff5522]">•</span>
                    <span>
                      {activeTab === "TH"
                        ? link.labelTh || link.labelEn
                        : link.labelEn || link.labelTh}
                    </span>
                  </Link>
                ))}
            </nav>
          )}
        </div>

        {/* Top-Right: Theme Toggle, Language Selector, Pill Contacts & Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button matching Admin */}
          {headerSettings.showThemeToggle && (
            <button
              type="button"
              className="icon-btn !w-8 !h-8 !rounded-full !bg-white/40 hover:!bg-white/60 !backdrop-blur-md !border !border-black/15 shadow-xs cursor-pointer flex items-center justify-center text-[#22252a] transition-all hover:scale-105"
              aria-label="Toggle theme (light/dark)"
              title="Toggle theme (light/dark)"
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
          )}

          {headerSettings.showLanguageSwitcher && (
            <div className="flex items-center text-[11px] font-bold text-[#555a64] tracking-widest bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 border border-black/10">
              <button
                type="button"
                onClick={() => setActiveTab("EN")}
                className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                  activeTab === "EN" ? "text-black font-extrabold" : "opacity-40 hover:opacity-80"
                }`}
              >
                EN
              </button>
              <span className="opacity-30">|</span>
              <button
                type="button"
                onClick={() => setActiveTab("TH")}
                className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                  activeTab === "TH" ? "text-black font-extrabold" : "opacity-40 hover:opacity-80"
                }`}
              >
                TH
              </button>
            </div>
          )}

          {headerSettings.contactPill?.enabled && (
            <Link
              href={headerSettings.contactPill.href || "/portal/documents"}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-black/20 hover:border-black/50 text-[11px] font-bold tracking-widest text-[#22252a] uppercase transition-all bg-white/30 hover:bg-white/50 backdrop-blur-md shadow-xs"
            >
              <span className="text-[#ff5522]">•</span>
              <span>
                {activeTab === "TH"
                  ? headerSettings.contactPill.labelTh || headerSettings.contactPill.labelEn
                  : headerSettings.contactPill.labelEn || headerSettings.contactPill.labelTh}
              </span>
            </Link>
          )}

          {/* Staff Console Avatar Menu */}
          {headerSettings.showAvatarMenu && (
            <div className="relative z-40">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Staff Console menu"
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-black/20 hover:border-black/50 text-[11px] font-bold tracking-wider text-[#22252a] uppercase transition-all bg-white/40 hover:bg-white/60 backdrop-blur-md shadow-xs cursor-pointer group"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff5522] to-[#ff7744] text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                      {isAuthenticated && user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                      ) : isAuthenticated && user ? (
                        initials
                      ) : (
                        <User className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>
                    <span className="hidden sm:inline font-semibold normal-case">
                      {isAuthenticated && user ? user.name : "Staff Console"}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </DropdownMenuPrimitive.Trigger>

                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="z-50 min-w-52 rounded-xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl p-1 text-xs text-[#22252a] animate-in fade-in zoom-in-95 duration-150"
                    align="end"
                    sideOffset={8}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-3 py-2 border-b border-black/5">
                        <p className="font-bold text-[#16181d] truncate">
                          {isAuthenticated && user ? user.name : "Staff Console"}
                        </p>
                        <p className="text-[11px] text-[#717782] truncate">
                          {isAuthenticated && user ? user.email : "ระบบสำหรับบุคลากรและเจ้าหน้าที่"}
                        </p>
                      </div>
                    </DropdownMenuPrimitive.Label>

                    {isAuthenticated && user ? (
                      <>
                        <DropdownMenuPrimitive.Item asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-[#22252a] font-medium"
                          >
                            <LayoutDashboard className="h-4 w-4 text-[#ff5522]" />
                            <span>ระบบบริหารจัดการ (Dashboard)</span>
                          </Link>
                        </DropdownMenuPrimitive.Item>

                        <DropdownMenuPrimitive.Item asChild>
                          <Link
                            href="/me"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-[#22252a] font-medium"
                          >
                            <User className="h-4 w-4 text-[#ff5522]" />
                            <span>โปรไฟล์ส่วนตัว</span>
                          </Link>
                        </DropdownMenuPrimitive.Item>

                        {isSuperAdmin && (
                          <DropdownMenuPrimitive.Item asChild>
                            <Link
                              href="/settings"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-[#22252a] font-medium"
                            >
                              <SettingsIcon className="h-4 w-4 text-[#ff5522]" />
                              <span>ตั้งค่าระบบ (Settings)</span>
                            </Link>
                          </DropdownMenuPrimitive.Item>
                        )}

                        <DropdownMenuPrimitive.Separator asChild>
                          <hr className="my-1 border-black/5" />
                        </DropdownMenuPrimitive.Separator>

                        <DropdownMenuPrimitive.Item asChild>
                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/portal" })}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer font-medium"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>ออกจากระบบ</span>
                          </button>
                        </DropdownMenuPrimitive.Item>
                      </>
                    ) : (
                      <>
                        <DropdownMenuPrimitive.Item asChild>
                          <Link
                            href="/login"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-[#22252a] font-medium"
                          >
                            <LogIn className="h-4 w-4 text-[#ff5522]" />
                            <span>เข้าสู่ระบบเจ้าหน้าที่ (Sign In)</span>
                          </Link>
                        </DropdownMenuPrimitive.Item>

                        <DropdownMenuPrimitive.Item asChild>
                          <Link
                            href="/forgot-password"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-[#22252a] font-medium"
                          >
                            <User className="h-4 w-4 opacity-60" />
                            <span>ลืมรหัสผ่าน (Forgot Password)</span>
                          </Link>
                        </DropdownMenuPrimitive.Item>
                      </>
                    )}
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO BODY: Giant Masked Typography & Manifesto Overlay
         ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex-1 px-6 sm:px-12 flex flex-col justify-between py-8 sm:py-12 lg:py-16 pointer-events-none">
        
        {/* Top Typography Row: Giant "EMBER" Mask (Clickable to explore) */}
        {topTypo.enabled && (
          <div className="relative mt-2 lg:mt-4 pointer-events-auto">
            <Link
              href={topTypo.linkHref || "/portal/news"}
              className="inline-block group cursor-pointer"
            >
              <span className="text-7xl sm:text-9xl lg:text-[13.5rem] font-black tracking-tighter leading-[0.8] select-none text-transparent uppercase opacity-0 group-hover:opacity-10 transition-opacity">
                {topTypo.text || "EMBER"}
              </span>
            </Link>
          </div>
        )}

        {/* Middle Manifesto Block (Left side) with Interactive Switcher */}
        {manifesto.enabled && (
          <div className="max-w-xl space-y-4 my-8 lg:my-0 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-full animate-ping" />
              <p className="text-[11px] font-mono tracking-widest text-[#666d77] uppercase font-semibold">
                {activeTab === "TH"
                  ? manifesto.badgeTextTh || manifesto.badgeTextEn || "เกี่ยวกับเรา"
                  : manifesto.badgeTextEn || manifesto.badgeTextTh || "ABOUT"}
              </p>
            </div>

            {activeTab === "TH" ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg text-[#16181d] space-y-2 animate-in fade-in duration-300">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff5522]" />
                  <span>{manifesto.headingTh || brandName}</span>
                </h2>
                <p className="text-sm sm:text-base font-medium leading-relaxed text-[#2a2f38]">
                  {manifesto.bodyTh ||
                    "เราผสานแก่นธรรมโบราณเข้ากับนวัตกรรมแห่งอนาคต สร้างสรรค์ผู้นำทางจิตปัญญา ผ่านการศึกษาและวิจัยชั้นนำระดับสากล"}
                </p>
              </div>
            ) : (
              <div className="transition-opacity duration-300">
                {manifesto.headingEn && (
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#ff5522]" />
                    <span>{manifesto.headingEn}</span>
                  </h2>
                )}
                <p className="text-xl sm:text-2xl lg:text-[28px] font-medium tracking-tight text-[#16181d] leading-snug drop-shadow-xs max-w-lg">
                  {manifesto.bodyEn ||
                    "We shape striking digital identities through bold contrasts and meaningful motion. Our design process transforms the primal into the powerful."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Giant Typography Watermark Alignment */}
        {watermark.enabled && (
          <div className="absolute right-6 sm:right-12 bottom-10 select-none pointer-events-none hidden sm:block">
            <span className="text-7xl sm:text-9xl lg:text-[13rem] font-black tracking-tighter text-white/90 drop-shadow-sm leading-none block">
              {watermark.text || "STUDIO"}
            </span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO FOOTER RAIL (Exact EMBER.dsgn Bottom Info Bar)
         ══════════════════════════════════════════════════════════════ */}
      {footerSettings.enabled && (
        <footer className="relative z-30 w-full px-6 sm:px-12 pb-7 flex flex-wrap items-end justify-between gap-6 text-[11px] font-mono tracking-wider text-[#555a64] uppercase">
          {/* Left: Explore CTA Button */}
          {footerSettings.ctaButton?.enabled ? (
            <div className="space-y-1">
              {footerSettings.ctaButton.eyebrow && (
                <p className="text-[9px] text-[#787e8a] tracking-widest">
                  {footerSettings.ctaButton.eyebrow}
                </p>
              )}
              <Link
                href={footerSettings.ctaButton.href || "/portal/programs"}
                className="group inline-flex items-center gap-1.5 font-bold text-black hover:text-[#ff5522] transition-colors py-1 px-2.5 rounded-full bg-white/20 hover:bg-white/40 border border-black/10 backdrop-blur-md"
              >
                <span>
                  {activeTab === "TH"
                    ? footerSettings.ctaButton.labelTh || footerSettings.ctaButton.labelEn || "สำรวจบริการและผลงาน"
                    : footerSettings.ctaButton.labelEn || footerSettings.ctaButton.labelTh || "EXPLORE OUR WORK"}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          ) : (
            <div />
          )}

          {/* Center: Social Links & Background Component Control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            {footerSettings.socialLinks && footerSettings.socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {footerSettings.socialLinks
                  .filter((s) => s.enabled !== false)
                  .map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-black transition-colors"
                    >
                      • {s.label}
                    </a>
                  ))}
              </div>
            )}

            {/* Background Photo Toggle: Fulfilling user request to have the photo as background component */}
            {hero.showBgToggle && showBgLayer && (
              <button
                type="button"
                onClick={cycleBgMode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-semibold bg-white/40 hover:bg-white/60 border border-black/15 text-[#16181d] transition-all cursor-pointer shadow-2xs backdrop-blur-md"
                title="สลับโหมดการแสดงภาพพื้นหลัง (ภาพสถานที่)"
              >
                <ImageIcon className="w-3 h-3 text-[#ff5522]" />
                <span>
                  ภาพพื้นหลัง:{" "}
                  {bgMode === "subtle"
                    ? "กลมกลืน (25%)"
                    : bgMode === "vivid"
                    ? "ชัดเจน (60%)"
                    : "สตูดิโอ (0%)"}
                </span>
              </button>
            )}
          </div>

          {/* Right: Location & Address */}
          {footerSettings.locationText?.enabled && (
            <div className="text-right text-[#5a606a] leading-tight text-[10px] sm:text-[11px]">
              <p className="font-semibold text-[#1e2229]">
                {footerSettings.locationText.title?.trim() || brandName}
              </p>
              {footerSettings.locationText.address && (
                <p>{footerSettings.locationText.address}</p>
              )}
            </div>
          )}
        </footer>
      )}

    </section>
  );
}
