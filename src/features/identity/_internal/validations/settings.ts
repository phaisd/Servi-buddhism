import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const heroNavLinkSchema = z.object({
  id: z.string(),
  labelTh: z.string().default(""),
  labelEn: z.string().default(""),
  href: z.string().default("#"),
  enabled: z.boolean().default(true),
});

export const heroSocialLinkSchema = z.object({
  id: z.string(),
  label: z.string().default(""),
  href: z.string().default("#"),
  enabled: z.boolean().default(true),
});

export const heroSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  layout: z.enum(["center-motion", "split", "minimal"]).default("center-motion"),
  heightMode: z.enum(["full", "screen-90", "compact"]).default("screen-90"),
  bgImageUrl: z.string().optional().default(""),
  bgModeDefault: z.enum(["subtle", "vivid", "minimal", "hidden"]).default("subtle"),
  showBgToggle: z.boolean().default(true),
  showMotionArtwork: z.boolean().default(true),
  motionArtworkUrl: z.string().optional().default(""),
  motionPreviewUrl: z.string().optional().default(""),
  topTypography: z.object({
    enabled: z.boolean().default(true),
    text: z.string().default("EMBER"),
    linkHref: z.string().default("/portal/news"),
  }).default({ enabled: true, text: "EMBER", linkHref: "/portal/news" }),
  bottomWatermark: z.object({
    enabled: z.boolean().default(true),
    text: z.string().default("STUDIO"),
  }).default({ enabled: true, text: "STUDIO" }),
  manifesto: z.object({
    enabled: z.boolean().default(true),
    badgeTextTh: z.string().default("เกี่ยวกับเรา"),
    badgeTextEn: z.string().default("ABOUT"),
    headingTh: z.string().default(""),
    headingEn: z.string().default(""),
    bodyTh: z.string().default(""),
    bodyEn: z.string().default(""),
  }).default({
    enabled: true,
    badgeTextTh: "เกี่ยวกับเรา",
    badgeTextEn: "ABOUT",
    headingTh: "",
    headingEn: "",
    bodyTh: "",
    bodyEn: "",
  }),
  header: z.object({
    showLogo: z.boolean().default(true),
    showBrandText: z.boolean().default(true),
    customBrandText: z.string().optional().default(""),
    showLanguageSwitcher: z.boolean().default(true),
    showThemeToggle: z.boolean().default(true),
    showAvatarMenu: z.boolean().default(true),
    contactPill: z.object({
      enabled: z.boolean().default(true),
      labelTh: z.string().default("ติดต่อเรา"),
      labelEn: z.string().default("CONTACTS"),
      href: z.string().default("/portal/documents"),
    }).default({
      enabled: true,
      labelTh: "ติดต่อเรา",
      labelEn: "CONTACTS",
      href: "/portal/documents",
    }),
    navLinks: z.array(heroNavLinkSchema).default([]),
  }).default({
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
    navLinks: [],
  }),
  footerRail: z.object({
    enabled: z.boolean().default(true),
    ctaButton: z.object({
      enabled: z.boolean().default(true),
      eyebrow: z.string().default("DOUBLE CLICK AND"),
      labelTh: z.string().default("สำรวจบริการและผลงาน"),
      labelEn: z.string().default("EXPLORE OUR WORK"),
      href: z.string().default("/portal/programs"),
    }).default({
      enabled: true,
      eyebrow: "DOUBLE CLICK AND",
      labelTh: "สำรวจบริการและผลงาน",
      labelEn: "EXPLORE OUR WORK",
      href: "/portal/programs",
    }),
    socialLinks: z.array(heroSocialLinkSchema).default([]),
    locationText: z.object({
      enabled: z.boolean().default(true),
      title: z.string().default(""),
      address: z.string().default("WANG NOI, AYUTTHAYA 13170, THAILAND"),
    }).default({
      enabled: true,
      title: "",
      address: "WANG NOI, AYUTTHAYA 13170, THAILAND",
    }),
  }).default({
    enabled: true,
    ctaButton: {
      enabled: true,
      eyebrow: "DOUBLE CLICK AND",
      labelTh: "สำรวจบริการและผลงาน",
      labelEn: "EXPLORE OUR WORK",
      href: "/portal/programs",
    },
    socialLinks: [],
    locationText: {
      enabled: true,
      title: "",
      address: "WANG NOI, AYUTTHAYA 13170, THAILAND",
    },
  }),
});

export const serviceItemSchema = z.object({
  id: z.string(),
  titleTh: z.string().default(""),
  titleEn: z.string().default(""),
  descTh: z.string().default(""),
  descEn: z.string().default(""),
  href: z.string().default("#"),
  icon: z.string().default("BookOpen"),
  badgeTh: z.string().default(""),
  badgeEn: z.string().default(""),
  enabled: z.boolean().default(true),
});

export const servicesSectionSchema = z.object({
  enabled: z.boolean().default(true),
  eyebrowTh: z.string().default("บริการสำคัญ"),
  eyebrowEn: z.string().default("Core Services"),
  titleTh: z.string().default("ระบบบริการการศึกษาและสารสนเทศ"),
  titleEn: z.string().default("Academic & Information Services"),
  viewAllTextTh: z.string().default("ดูบริการทั้งหมด"),
  viewAllTextEn: z.string().default("View All"),
  viewAllHref: z.string().default("/portal/programs"),
  showViewAll: z.boolean().default(true),
  items: z.array(serviceItemSchema).default([]),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || v.startsWith("/") || z.string().url().safeParse(v).success, {
      message: "url",
    })
    .or(z.literal(""))
    .default(""),
  palette: z.enum(PALETTE_IDS),
  hero: heroSettingsSchema.optional(),
  servicesSection: servicesSectionSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type HeroSettingsInput = z.infer<typeof heroSettingsSchema>;
export type HeroNavLinkInput = z.infer<typeof heroNavLinkSchema>;
export type HeroSocialLinkInput = z.infer<typeof heroSocialLinkSchema>;

export type ServiceItemInput = z.infer<typeof serviceItemSchema>;
export type ServicesSectionInput = z.infer<typeof servicesSectionSchema>;

export type ServiceItem = ServiceItemInput;
export type ServicesSectionSettings = ServicesSectionInput;

export const DEFAULT_SERVICES_SECTION_SETTINGS: ServicesSectionSettings = {
  enabled: true,
  eyebrowTh: "บริการสำคัญ",
  eyebrowEn: "Core Services",
  titleTh: "ระบบบริการการศึกษาและสารสนเทศ",
  titleEn: "Academic & Information Services",
  viewAllTextTh: "ดูบริการทั้งหมด",
  viewAllTextEn: "View All",
  viewAllHref: "/portal/programs",
  showViewAll: true,
  items: [
    {
      id: "programs",
      titleTh: "หลักสูตรระดับปริญญา",
      titleEn: "Academic Programs",
      descTh: "ปริญญาตรี โท เอก สาขาพระพุทธศาสนา",
      descEn: "Undergraduate, Master & Ph.D.",
      href: "/portal/programs",
      icon: "BookOpen",
      badgeTh: "เปิดรับสมัคร",
      badgeEn: "Admissions",
      enabled: true,
    },
    {
      id: "meetings",
      titleTh: "ระบบจองห้องประชุม",
      titleEn: "Room Booking System",
      descTh: "จองห้องประชุมและอุปกรณ์ออนไลน์",
      descEn: "Online Conference Reservations",
      href: "/portal/meetings",
      icon: "Video",
      badgeTh: "บริการออนไลน์",
      badgeEn: "Online",
      enabled: true,
    },
    {
      id: "certificates",
      titleTh: "คำร้อง & ขอใบรับรอง",
      titleEn: "Student Requests & Forms",
      descTh: "ยื่นคำร้องขอเอกสารสำคัญทางการศึกษา",
      descEn: "Official Certificates & Requests",
      href: "/portal/certificates/request",
      icon: "Award",
      badgeTh: "บริการนิสิต",
      badgeEn: "Services",
      enabled: true,
    },
    {
      id: "documents",
      titleTh: "คลังเอกสาร & แบบฟอร์ม",
      titleEn: "Document Downloads",
      descTh: "ดาวน์โหลดแบบฟอร์มคำร้องและระเบียบ",
      descEn: "Academic Guidelines & Downloads",
      href: "/portal/documents",
      icon: "FileText",
      badgeTh: "ดาวน์โหลด",
      badgeEn: "Downloads",
      enabled: true,
    },
  ],
};

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
  palette: import("@/shared/lib/palette").PaletteId;
  hero: HeroSettings;
  servicesSection: ServicesSectionSettings;
}

