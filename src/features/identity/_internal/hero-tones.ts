import type { HeroTextTone } from "./validations/settings";

export interface HeroToneConfig {
  id: HeroTextTone;
  nameTh: string;
  nameEn: string;
  swatchHex: string;
  primaryColor: string;
  bodyColor: string;
  mutedColor: string;
  accentColor: string;
  strokeColor: string;
  maskTextColor: string;
  watermarkColor: string;
  watermarkStroke: string;
  badgeBg: string;
  badgeBorder: string;
  cardBg: string;
  cardBorder: string;
  pillBg: string;
  pillBorder: string;
}

export const HERO_TONE_CONFIGS: Record<Exclude<HeroTextTone, "custom">, HeroToneConfig> = {
  dark: {
    id: "dark",
    nameTh: "ดำเข้มคมชัด (Classic Dark)",
    nameEn: "Classic Charcoal Dark",
    swatchHex: "#0f172a",
    primaryColor: "#090d16",
    bodyColor: "#1e293b",
    mutedColor: "#475569",
    accentColor: "#ff5522",
    strokeColor: "rgba(15, 23, 42, 0.35)",
    maskTextColor: "rgba(15, 23, 42, 0.06)",
    watermarkColor: "rgba(15, 23, 42, 0.08)",
    watermarkStroke: "rgba(15, 23, 42, 0.18)",
    badgeBg: "rgba(255, 255, 255, 0.88)",
    badgeBorder: "rgba(15, 23, 42, 0.18)",
    cardBg: "rgba(255, 255, 255, 0.82)",
    cardBorder: "rgba(255, 255, 255, 0.95)",
    pillBg: "rgba(255, 255, 255, 0.85)",
    pillBorder: "rgba(15, 23, 42, 0.15)",
  },
  navy: {
    id: "navy",
    nameTh: "กรมท่าสง่างาม (Deep Navy)",
    nameEn: "Elegant Deep Navy",
    swatchHex: "#0f2942",
    primaryColor: "#0a192f",
    bodyColor: "#172a45",
    mutedColor: "#334e68",
    accentColor: "#0284c7",
    strokeColor: "rgba(10, 25, 47, 0.35)",
    maskTextColor: "rgba(10, 25, 47, 0.06)",
    watermarkColor: "rgba(10, 25, 47, 0.09)",
    watermarkStroke: "rgba(10, 25, 47, 0.2)",
    badgeBg: "rgba(240, 246, 255, 0.92)",
    badgeBorder: "rgba(147, 197, 253, 0.45)",
    cardBg: "rgba(240, 246, 255, 0.85)",
    cardBorder: "rgba(219, 234, 254, 0.95)",
    pillBg: "rgba(240, 246, 255, 0.88)",
    pillBorder: "rgba(147, 197, 253, 0.35)",
  },
  amber: {
    id: "amber",
    nameTh: "ทองอำพันพุทธศิลป์ (Buddhist Amber & Gold)",
    nameEn: "Buddhist Amber & Gold",
    swatchHex: "#b45309",
    primaryColor: "#451a03",
    bodyColor: "#78350f",
    mutedColor: "#92400e",
    accentColor: "#d97706",
    strokeColor: "rgba(120, 53, 15, 0.38)",
    maskTextColor: "rgba(120, 53, 15, 0.07)",
    watermarkColor: "rgba(120, 53, 15, 0.09)",
    watermarkStroke: "rgba(120, 53, 15, 0.2)",
    badgeBg: "rgba(255, 251, 235, 0.92)",
    badgeBorder: "rgba(252, 211, 77, 0.55)",
    cardBg: "rgba(255, 251, 235, 0.88)",
    cardBorder: "rgba(254, 243, 199, 0.95)",
    pillBg: "rgba(255, 251, 235, 0.88)",
    pillBorder: "rgba(252, 211, 77, 0.45)",
  },
  crimson: {
    id: "crimson",
    nameTh: "แดงชาดมงคล (Imperial Crimson)",
    nameEn: "Imperial Crimson",
    swatchHex: "#9f1239",
    primaryColor: "#4c0519",
    bodyColor: "#881337",
    mutedColor: "#9f1239",
    accentColor: "#e11d48",
    strokeColor: "rgba(136, 19, 55, 0.35)",
    maskTextColor: "rgba(136, 19, 55, 0.06)",
    watermarkColor: "rgba(136, 19, 55, 0.09)",
    watermarkStroke: "rgba(136, 19, 55, 0.2)",
    badgeBg: "rgba(255, 241, 242, 0.92)",
    badgeBorder: "rgba(253, 164, 175, 0.45)",
    cardBg: "rgba(255, 241, 242, 0.88)",
    cardBorder: "rgba(255, 228, 230, 0.95)",
    pillBg: "rgba(255, 241, 242, 0.88)",
    pillBorder: "rgba(253, 164, 175, 0.35)",
  },
  emerald: {
    id: "emerald",
    nameTh: "เขียวมรกตสุขสงบ (Serene Emerald)",
    nameEn: "Serene Emerald",
    swatchHex: "#047857",
    primaryColor: "#022c22",
    bodyColor: "#064e3b",
    mutedColor: "#047857",
    accentColor: "#059669",
    strokeColor: "rgba(6, 78, 59, 0.35)",
    maskTextColor: "rgba(6, 78, 59, 0.06)",
    watermarkColor: "rgba(6, 78, 59, 0.09)",
    watermarkStroke: "rgba(6, 78, 59, 0.2)",
    badgeBg: "rgba(236, 253, 245, 0.92)",
    badgeBorder: "rgba(110, 231, 183, 0.45)",
    cardBg: "rgba(236, 253, 245, 0.88)",
    cardBorder: "rgba(209, 250, 229, 0.95)",
    pillBg: "rgba(236, 253, 245, 0.88)",
    pillBorder: "rgba(110, 231, 183, 0.35)",
  },
  slate: {
    id: "slate",
    nameTh: "เทาสเลทโมเดิร์น (Modern Slate)",
    nameEn: "Modern Slate",
    swatchHex: "#334155",
    primaryColor: "#0f172a",
    bodyColor: "#334155",
    mutedColor: "#64748b",
    accentColor: "#2563eb",
    strokeColor: "rgba(51, 65, 85, 0.32)",
    maskTextColor: "rgba(51, 65, 85, 0.06)",
    watermarkColor: "rgba(51, 65, 85, 0.09)",
    watermarkStroke: "rgba(51, 65, 85, 0.18)",
    badgeBg: "rgba(248, 250, 252, 0.92)",
    badgeBorder: "rgba(203, 213, 225, 0.55)",
    cardBg: "rgba(248, 250, 252, 0.88)",
    cardBorder: "rgba(226, 232, 240, 0.95)",
    pillBg: "rgba(248, 250, 252, 0.88)",
    pillBorder: "rgba(203, 213, 225, 0.45)",
  },
};

export function getHeroToneConfig(
  tone: HeroTextTone = "dark",
  customHex?: string
): HeroToneConfig {
  if (tone === "custom" && customHex && /^#[0-9a-fA-F]{3,8}$/.test(customHex.trim())) {
    const hex = customHex.trim();
    return {
      id: "custom",
      nameTh: "กำหนดสีเอง (Custom)",
      nameEn: "Custom Hex Tone",
      swatchHex: hex,
      primaryColor: hex,
      bodyColor: hex,
      mutedColor: hex,
      accentColor: hex,
      strokeColor: `${hex}55`,
      maskTextColor: `${hex}10`,
      watermarkColor: `${hex}16`,
      watermarkStroke: `${hex}33`,
      badgeBg: "rgba(255, 255, 255, 0.92)",
      badgeBorder: `${hex}40`,
      cardBg: "rgba(255, 255, 255, 0.88)",
      cardBorder: "rgba(255, 255, 255, 0.95)",
      pillBg: "rgba(255, 255, 255, 0.9)",
      pillBorder: `${hex}33`,
    };
  }
  return HERO_TONE_CONFIGS[tone as keyof typeof HERO_TONE_CONFIGS] ?? HERO_TONE_CONFIGS.dark;
}
