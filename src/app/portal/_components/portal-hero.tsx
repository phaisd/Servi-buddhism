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
import type { TenantSettings } from "@/features/identity";

interface PortalHeroProps {
  tenantSettings?: TenantSettings | null;
  locale?: string;
}

export function PortalHero({ tenantSettings, locale = "th" }: PortalHeroProps) {
  const { user, isAuthenticated, isSuperAdmin } = useAppSession();
  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const [activeTab, setActiveTab] = React.useState<"TH" | "EN">(locale === "th" ? "TH" : "EN");
  // Background photo blend levels: 0.25 (subtle), 0.60 (vivid), 0.0 (studio only)
  const [bgMode, setBgMode] = React.useState<"subtle" | "vivid" | "minimal">("subtle");

  const brandName =
    activeTab === "TH"
      ? tenantSettings?.nameTh || "คณะพุทธศาสตร์ มจร"
      : tenantSettings?.nameEn || "Faculty of Buddhism";

  const cycleBgMode = () => {
    setBgMode((prev) => {
      if (prev === "subtle") return "vivid";
      if (prev === "vivid") return "minimal";
      return "subtle";
    });
  };

  const bgOpacityClass =
    bgMode === "vivid"
      ? "opacity-60"
      : bgMode === "subtle"
      ? "opacity-25"
      : "opacity-0";

  return (
    <section className="relative w-full min-h-[92vh] xl:min-h-screen bg-gradient-to-r from-[#b7bbc2] via-[#ced1d7] to-[#dadde2] text-[#111317] overflow-hidden select-none font-sans flex flex-col justify-between">
      
      {/* ══════════════════════════════════════════════════════════════
          BACKGROUND COMPONENT LAYER (User's Photo: Faculty Landmark)
          - Blended smoothly into the studio atmosphere
          - Allows user to toggle intensity (Subtle / Vivid / Minimal)
         ══════════════════════════════════════════════════════════════ */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none mix-blend-overlay ${bgOpacityClass}`}
        style={{
          backgroundImage: `url('/buddhist-hero-bg.jpg')`,
          filter: "saturate(1.2) contrast(1.1)",
        }}
      />
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none mix-blend-multiply ${
          bgMode === "minimal" ? "opacity-0" : "opacity-15"
        }`}
        style={{
          backgroundImage: `url('/buddhist-hero-bg.jpg')`,
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC 3D MOTION ARTWORK (Exact EMBER.dsgn Animation Loop)
          30 FPS buttery smooth animation from MotionSites AI
         ══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
        <picture className="w-full h-full flex items-center justify-center">
          <source srcSet="/ember_animation_30fps.webp" type="image/webp" />
          <img
            src="/ember_preview.gif"
            alt="EMBER.dsgn 3D Creative Designer Motion"
            className="w-full h-full object-cover lg:object-contain object-center scale-[1.01] transition-transform duration-700"
          />
        </picture>
        {/* Soft edge feathering so the animation seamlessly melds with full-bleed viewports */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#b7bbc2] to-transparent pointer-events-none hidden xl:block" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#dadde2] to-transparent pointer-events-none hidden xl:block" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TOP NAVIGATION BAR (Exact EMBER.dsgn Header layout)
          Sharp, interactive, functional links over the video artwork
         ══════════════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full px-6 sm:px-12 pt-7 flex items-center justify-between text-xs tracking-wider">
        {/* Top-Left: Logo & Brand Symbol */}
        <div className="flex items-center gap-10">
          <Link href="/portal" className="flex items-center gap-2.5 group">
            {/* 4-block orange logo grid icon from EMBER.dsgn */}
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90">
              <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
              <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
              <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
              <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-[1px]" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#16181d] uppercase transition-colors group-hover:text-black">
              BUDDHISM<span className="text-[#ff5522]">.dsgn</span>
            </span>
          </Link>

          {/* Navigation Items with dot prefixes (Exact EMBER.dsgn style) */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-semibold tracking-widest text-[#444a54] uppercase">
            <Link
              href="/portal/news"
              className="hover:text-black transition-colors flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-black/5"
            >
              <span className="text-[#ff5522]">•</span>
              <span>{activeTab === "TH" ? "WORKS / ข่าวสาร" : "WORKS"}</span>
            </Link>
            <Link
              href="/portal/programs"
              className="hover:text-black transition-colors flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-black/5"
            >
              <span className="text-[#ff5522]">•</span>
              <span>{activeTab === "TH" ? "SERVICES / บริการ" : "SERVICES"}</span>
            </Link>
            <Link
              href="/portal/personnel"
              className="hover:text-black transition-colors flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-black/5"
            >
              <span className="text-[#ff5522]">•</span>
              <span>{activeTab === "TH" ? "ABOUT / บุคลากร" : "ABOUT"}</span>
            </Link>
            <Link
              href="/portal/events"
              className="hover:text-black transition-colors flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-black/5"
            >
              <span className="text-[#ff5522]">•</span>
              <span>{activeTab === "TH" ? "TEAM / กิจกรรม" : "TEAM"}</span>
            </Link>
          </nav>
        </div>

        {/* Top-Right: Language Selector & Pill Contacts */}
        <div className="flex items-center gap-3 sm:gap-4">
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

          <Link
            href="/portal/documents"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-black/20 hover:border-black/50 text-[11px] font-bold tracking-widest text-[#22252a] uppercase transition-all bg-white/30 hover:bg-white/50 backdrop-blur-md shadow-xs"
          >
            <span className="text-[#ff5522]">•</span>
            <span>CONTACTS</span>
          </Link>

          {/* Staff Console Avatar Menu */}
          <div className="relative z-40">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <button
                  type="button"
                  aria-label="Staff Console menu"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/20 hover:border-black/50 text-[11px] font-bold tracking-wider text-[#22252a] uppercase transition-all bg-white/30 hover:bg-white/50 backdrop-blur-md shadow-xs cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#ff5522] text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                    {isAuthenticated && user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="h-full w-full object-cover" />
                    ) : isAuthenticated && user ? (
                      initials
                    ) : (
                      <User className="w-3 h-3 text-white" />
                    )}
                  </span>
                  <span className="hidden sm:inline">
                    {isAuthenticated && user ? user.name : "STAFF"}
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
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO BODY: Giant Masked Typography & Manifesto Overlay
         ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex-1 px-6 sm:px-12 flex flex-col justify-between py-8 sm:py-12 lg:py-16 pointer-events-none">
        
        {/* Top Typography Row: Giant "EMBER" Mask (Clickable to explore) */}
        <div className="relative mt-2 lg:mt-4 pointer-events-auto">
          <Link href="/portal/news" className="inline-block group cursor-pointer">
            <span className="text-7xl sm:text-9xl lg:text-[13.5rem] font-black tracking-tighter leading-[0.8] select-none text-transparent uppercase opacity-0 group-hover:opacity-10 transition-opacity">
              EMBER
            </span>
          </Link>
        </div>

        {/* Middle Manifesto Block (Left side) with Interactive Switcher */}
        <div className="max-w-xl space-y-4 my-8 lg:my-0 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#ff5522] rounded-full animate-ping" />
            <p className="text-[11px] font-mono tracking-widest text-[#666d77] uppercase font-semibold">
              ABOUT
            </p>
          </div>

          {activeTab === "TH" ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg text-[#16181d] space-y-2 animate-in fade-in duration-300">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff5522]" />
                <span>{brandName}</span>
              </h2>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-[#2a2f38]">
                เราผสานแก่นธรรมโบราณเข้ากับนวัตกรรมแห่งอนาคต
                สร้างสรรค์ผู้นำทางจิตปัญญา ผ่านการศึกษาและวิจัยชั้นนำระดับสากล
              </p>
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <p className="text-xl sm:text-2xl lg:text-[28px] font-medium tracking-tight text-[#16181d] leading-snug drop-shadow-xs max-w-lg">
                We shape striking digital identities through bold contrasts and meaningful motion.
                Our design process transforms the primal into the powerful.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Giant "STUDIO" Typography Watermark Alignment */}
        <div className="absolute right-6 sm:right-12 bottom-10 select-none pointer-events-none hidden sm:block">
          <span className="text-7xl sm:text-9xl lg:text-[13rem] font-black tracking-tighter text-white/90 drop-shadow-sm leading-none block">
            STUDIO
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO FOOTER RAIL (Exact EMBER.dsgn Bottom Info Bar)
         ══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-30 w-full px-6 sm:px-12 pb-7 flex flex-wrap items-end justify-between gap-6 text-[11px] font-mono tracking-wider text-[#555a64] uppercase">
        {/* Left: Explore CTA Button */}
        <div className="space-y-1">
          <p className="text-[9px] text-[#787e8a] tracking-widest">DOUBLE CLICK AND</p>
          <Link
            href="/portal/programs"
            className="group inline-flex items-center gap-1.5 font-bold text-black hover:text-[#ff5522] transition-colors py-1 px-2.5 rounded-full bg-white/20 hover:bg-white/40 border border-black/10 backdrop-blur-md"
          >
            <span>EXPLORE OUR WORK</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Center: Social Links & Background Component Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              • FACEBOOK
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              • INSTAGRAM
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              • TELEGRAM
            </a>
          </div>

          {/* Background Photo Toggle: Fulfilling user request to have the photo as background component */}
          <button
            type="button"
            onClick={cycleBgMode}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-semibold bg-white/40 hover:bg-white/60 border border-black/15 text-[#16181d] transition-all cursor-pointer shadow-2xs backdrop-blur-md"
            title="สลับโหมดการแสดงภาพพื้นหลังที่แนบมา (คณะพุทธศาสตร์)"
          >
            <ImageIcon className="w-3 h-3 text-[#ff5522]" />
            <span>ภาพพื้นหลัง: {bgMode === "subtle" ? "กลมกลืน (25%)" : bgMode === "vivid" ? "ชัดเจน (60%)" : "สตูดิโอ (0%)"}</span>
          </button>
        </div>

        {/* Right: Location & Address */}
        <div className="text-right text-[#5a606a] leading-tight text-[10px] sm:text-[11px]">
          <p className="font-semibold text-[#1e2229]">{brandName}</p>
          <p>WANG NOI, AYUTTHAYA 13170, THAILAND</p>
        </div>
      </footer>

    </section>
  );
}
