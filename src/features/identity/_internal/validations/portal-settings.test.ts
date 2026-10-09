import { describe, it, expect } from "vitest";
import {
  heroSettingsSchema,
  servicesSectionSchema,
  newsSectionSchema,
  facultyBannerSchema,
  footerSchema,
  updateSettingsSchema,
  DEFAULT_HERO_SETTINGS,
  DEFAULT_SERVICES_SECTION_SETTINGS,
  DEFAULT_NEWS_SECTION_SETTINGS,
  DEFAULT_FACULTY_BANNER_SETTINGS,
  DEFAULT_FOOTER_SETTINGS,
} from "./settings";

describe("Portal Settings Validations", () => {
  describe("Hero Settings Schema", () => {
    it("คืนค่าเริ่มต้นที่ถูกต้องเมื่อส่ง object เปล่า", () => {
      const parsed = heroSettingsSchema.parse({});
      expect(parsed.enabled).toBe(true);
      expect(parsed.layout).toBe("center-motion");
      expect(parsed.heightMode).toBe("screen-90");
      expect(parsed.bgModeDefault).toBe("subtle");
      expect(parsed.textTone).toBe("dark");
      expect(parsed.topTypography.text).toBe("EMBER");
      expect(parsed.bottomWatermark.text).toBe("STUDIO");
    });

    it("DEFAULT_HERO_SETTINGS ผ่านการตรวจสอบของ schema ได้สมบูรณ์", () => {
      const parsed = heroSettingsSchema.parse(DEFAULT_HERO_SETTINGS);
      expect(parsed.topTypography.text).toBe(DEFAULT_HERO_SETTINGS.topTypography.text);
      expect(parsed.header.navLinks.length).toBeGreaterThan(0);
      expect(parsed.footerRail.socialLinks.length).toBeGreaterThan(0);
    });

    it("ยอมรับการปรับแต่งค่าเฉพาะบางฟิลด์", () => {
      const custom = heroSettingsSchema.parse({
        enabled: false,
        layout: "minimal",
        topTypography: { enabled: true, text: "CUSTOM_BRAND", linkHref: "/portal" },
      });
      expect(custom.enabled).toBe(false);
      expect(custom.layout).toBe("minimal");
      expect(custom.topTypography.text).toBe("CUSTOM_BRAND");
    });
  });

  describe("Services Section Schema", () => {
    it("DEFAULT_SERVICES_SECTION_SETTINGS มีข้อมูลบริการเริ่มต้นถูกต้อง", () => {
      const parsed = servicesSectionSchema.parse(DEFAULT_SERVICES_SECTION_SETTINGS);
      expect(parsed.items.length).toBe(DEFAULT_SERVICES_SECTION_SETTINGS.items.length);
      expect(parsed.enabled).toBe(true);
      expect(parsed.items[0].id).toBe("programs");
    });

    it("คืนค่าเริ่มต้นเมื่อส่ง object เปล่า", () => {
      const parsed = servicesSectionSchema.parse({});
      expect(parsed.enabled).toBe(true);
      expect(parsed.titleTh).toBe("ระบบบริการการศึกษาและสารสนเทศ");
      expect(parsed.showViewAll).toBe(true);
    });
  });

  describe("News Section Schema", () => {
    it("ตรวจสอบและคืนค่า default ของ newsSectionSchema", () => {
      const parsed = newsSectionSchema.parse({});
      expect(parsed.enabled).toBe(true);
      expect(parsed.pageSize).toBe(4);
      expect(parsed.viewAllHref).toBe("/portal/news");
    });

    it("บังคับ pageSize อยู่ในช่วง 1 ถึง 12", () => {
      expect(newsSectionSchema.safeParse({ pageSize: 0 }).success).toBe(false);
      expect(newsSectionSchema.safeParse({ pageSize: 13 }).success).toBe(false);
      expect(newsSectionSchema.safeParse({ pageSize: 6 }).success).toBe(true);
    });
  });

  describe("Faculty Banner Schema", () => {
    it("ตรวจสอบ DEFAULT_FACULTY_BANNER_SETTINGS ถูกต้อง", () => {
      const parsed = facultyBannerSchema.parse(DEFAULT_FACULTY_BANNER_SETTINGS);
      expect(parsed.enabled).toBe(true);
      expect(parsed.showCircles).toBe(true);
      expect(parsed.buttonHref).toBe("/portal/personnel");
    });
  });

  describe("Footer Schema", () => {
    it("ตรวจสอบ DEFAULT_FOOTER_SETTINGS มีข้อมูลติดต่อครบถ้วน", () => {
      const parsed = footerSchema.parse(DEFAULT_FOOTER_SETTINGS);
      expect(parsed.enabled).toBe(true);
      expect(parsed.phone).toContain("035-248-000");
      expect(parsed.email).toBe("buddhist@mcu.ac.th");
      expect(parsed.mainWebsiteUrl).toBe("https://www.mcu.ac.th");
      expect(parsed.showStaffConsole).toBe(true);
    });

    it("ยอมรับการปิดแสดงผล Footer และปรับเปลี่ยนข้อมูลติดต่อ", () => {
      const custom = footerSchema.parse({
        enabled: false,
        phone: "02-123-4567",
        email: "test@domain.com",
        showStaffConsole: false,
      });
      expect(custom.enabled).toBe(false);
      expect(custom.phone).toBe("02-123-4567");
      expect(custom.email).toBe("test@domain.com");
      expect(custom.showStaffConsole).toBe(false);
    });
  });

  describe("Update Settings Schema (Root Form)", () => {
    it("ตรวจสอบข้อมูลฟอร์มหลักพร้อมทุก section ย่อย", () => {
      const fullInput = {
        nameTh: "คณะพุทธศาสตร์ มจร",
        nameEn: "Faculty of Buddhism, MCU",
        logoUrl: "/logo.png",
        palette: "coral" as const,
        hero: DEFAULT_HERO_SETTINGS,
        servicesSection: DEFAULT_SERVICES_SECTION_SETTINGS,
        newsSection: DEFAULT_NEWS_SECTION_SETTINGS,
        facultyBanner: DEFAULT_FACULTY_BANNER_SETTINGS,
        footer: DEFAULT_FOOTER_SETTINGS,
      };

      const result = updateSettingsSchema.parse(fullInput);
      expect(result.nameTh).toBe("คณะพุทธศาสตร์ มจร");
      expect(result.palette).toBe("coral");
      expect(result.footer?.phone).toBe(DEFAULT_FOOTER_SETTINGS.phone);
    });

    it("ปฏิเสธชื่อภาษาไทยหรืออังกฤษที่ว่างเปล่า", () => {
      expect(
        updateSettingsSchema.safeParse({
          nameTh: "   ",
          nameEn: "Faculty",
          palette: "blue",
        }).success
      ).toBe(false);
    });
  });
});
