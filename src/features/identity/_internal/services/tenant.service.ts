import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput, HeroSettingsInput, HeroNavLinkInput, HeroSocialLinkInput } from "../validations/settings";

export type HeroSettings = HeroSettingsInput;
export type HeroNavLink = HeroNavLinkInput;
export type HeroSocialLink = HeroSocialLinkInput;

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  enabled: true,
  layout: "center-motion",
  heightMode: "screen-90",
  bgImageUrl: "/buddhist-hero-bg.jpg",
  bgModeDefault: "subtle",
  showBgToggle: true,
  showMotionArtwork: true,
  motionArtworkUrl: "/ember_animation_30fps.webp",
  motionPreviewUrl: "/ember_preview.gif",
  topTypography: {
    enabled: true,
    text: "EMBER",
    linkHref: "/portal/news",
  },
  bottomWatermark: {
    enabled: true,
    text: "STUDIO",
  },
  manifesto: {
    enabled: true,
    badgeTextTh: "เกี่ยวกับเรา",
    badgeTextEn: "ABOUT",
    headingTh: "",
    headingEn: "",
    bodyTh: "เราผสานแก่นธรรมโบราณเข้ากับนวัตกรรมแห่งอนาคต สร้างสรรค์ผู้นำทางจิตปัญญา ผ่านการศึกษาและวิจัยชั้นนำระดับสากล",
    bodyEn: "We shape striking digital identities through bold contrasts and meaningful motion. Our design process transforms the primal into the powerful.",
  },
  header: {
    showLogo: true,
    showBrandText: true,
    customBrandText: "",
    showLanguageSwitcher: true,
    showThemeToggle: true,
    showAvatarMenu: true,
    contactPill: {
      enabled: true,
      labelTh: "ติดต่อเรา",
      labelEn: "CONTACTS",
      href: "/portal/documents",
    },
    navLinks: [
      { id: "news", labelTh: "WORKS / ข่าวสาร", labelEn: "WORKS", href: "/portal/news", enabled: true },
      { id: "programs", labelTh: "SERVICES / บริการ", labelEn: "SERVICES", href: "/portal/programs", enabled: true },
      { id: "personnel", labelTh: "ABOUT / บุคลากร", labelEn: "ABOUT", href: "/portal/personnel", enabled: true },
      { id: "events", labelTh: "TEAM / กิจกรรม", labelEn: "TEAM", href: "/portal/events", enabled: true },
    ],
  },
  footerRail: {
    enabled: true,
    ctaButton: {
      enabled: true,
      eyebrow: "DOUBLE CLICK AND",
      labelTh: "สำรวจบริการและผลงาน",
      labelEn: "EXPLORE OUR WORK",
      href: "/portal/programs",
    },
    socialLinks: [
      { id: "fb", label: "FACEBOOK", href: "https://facebook.com", enabled: true },
      { id: "ig", label: "INSTAGRAM", href: "https://instagram.com", enabled: true },
      { id: "tg", label: "TELEGRAM", href: "https://t.me", enabled: true },
    ],
    locationText: {
      enabled: true,
      title: "",
      address: "WANG NOI, AYUTTHAYA 13170, THAILAND",
    },
  },
};

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  hero: HeroSettings;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settingsObj = (t.settings as { palette?: unknown; hero?: unknown }) ?? {};
  const p = settingsObj.palette;
  const rawHero = (settingsObj.hero as Partial<HeroSettings>) ?? {};
  const hero: HeroSettings = {
    ...DEFAULT_HERO_SETTINGS,
    ...rawHero,
    topTypography: { ...DEFAULT_HERO_SETTINGS.topTypography, ...(rawHero.topTypography ?? {}) },
    bottomWatermark: { ...DEFAULT_HERO_SETTINGS.bottomWatermark, ...(rawHero.bottomWatermark ?? {}) },
    manifesto: { ...DEFAULT_HERO_SETTINGS.manifesto, ...(rawHero.manifesto ?? {}) },
    header: {
      ...DEFAULT_HERO_SETTINGS.header,
      ...(rawHero.header ?? {}),
      contactPill: { ...DEFAULT_HERO_SETTINGS.header.contactPill, ...(rawHero.header?.contactPill ?? {}) },
      navLinks: rawHero.header?.navLinks?.length ? rawHero.header.navLinks : DEFAULT_HERO_SETTINGS.header.navLinks,
    },
    footerRail: {
      ...DEFAULT_HERO_SETTINGS.footerRail,
      ...(rawHero.footerRail ?? {}),
      ctaButton: { ...DEFAULT_HERO_SETTINGS.footerRail.ctaButton, ...(rawHero.footerRail?.ctaButton ?? {}) },
      socialLinks: rawHero.footerRail?.socialLinks?.length ? rawHero.footerRail.socialLinks : DEFAULT_HERO_SETTINGS.footerRail.socialLinks,
      locationText: { ...DEFAULT_HERO_SETTINGS.footerRail.locationText, ...(rawHero.footerRail?.locationText ?? {}) },
    },
  };

  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    hero,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge palette & hero ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const existing = (t.settings as object) ?? {};
    const updatedSettings = {
      ...existing,
      palette: input.palette,
      ...(input.hero ? { hero: input.hero } : {}),
    };
    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: updatedSettings,
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

async function fallbackTenantId(): Promise<string | null> {
  const t = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "asc" }],
    select: { id: true },
  });
  return t?.id ?? (await prisma.tenant.findFirst({ select: { id: true } }))?.id ?? null;
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await fallbackTenantId());
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});

/** ใช้โดย layout ต่าง ๆ ทุก request — tenant settings จาก session ถ้ามี ไม่งั้น tenant แรก · ไม่ throw */
export const resolveTenantSettings = cache(async (): Promise<TenantSettings | null> => {
  try {
    const tenantId = (await sessionTenantId()) || (await fallbackTenantId());
    return tenantId ? await readTenantSettings(tenantId, prisma) : null;
  } catch {
    return null;
  }
});

