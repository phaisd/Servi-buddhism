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
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type HeroSettingsInput = z.infer<typeof heroSettingsSchema>;
export type HeroNavLinkInput = z.infer<typeof heroNavLinkSchema>;
export type HeroSocialLinkInput = z.infer<typeof heroSocialLinkSchema>;
