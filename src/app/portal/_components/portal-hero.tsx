"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { DEFAULT_HERO_SETTINGS, type TenantSettings, type HeroSettings } from "@/features/identity";

interface PortalHeroProps {
  tenantSettings?: TenantSettings | null;
  locale?: string;
}

export function PortalHero({ tenantSettings, locale = "th" }: PortalHeroProps) {
  const [activeTab] = React.useState<"TH" | "EN">(locale === "th" ? "TH" : "EN");

  const hero: HeroSettings = React.useMemo(() => {
    return tenantSettings?.hero ?? DEFAULT_HERO_SETTINGS;
  }, [tenantSettings?.hero]);

  const defaultBg = hero.bgModeDefault ?? "subtle";
  const [userBgMode, setUserBgMode] = React.useState<HeroSettings["bgModeDefault"] | null>(null);
  const bgMode = userBgMode ?? defaultBg;

  const brandName =
    activeTab === "TH"
      ? tenantSettings?.nameTh || "คณะพุทธศาสตร์ มจร"
      : tenantSettings?.nameEn || "Faculty of Buddhism";

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
      ? "min-h-[calc(100vh-64px)]"
      : hero.heightMode === "compact"
      ? "min-h-[70vh] lg:min-h-[78vh]"
      : "min-h-[88vh] xl:min-h-[calc(100vh-64px)]";

  const bgImageUrl = hero.bgImageUrl?.trim() || "/buddhist-hero-bg.jpg";
  const showBgLayer = hero.bgModeDefault !== "hidden";

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
