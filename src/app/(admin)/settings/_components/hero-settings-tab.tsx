"use client";

import * as React from "react";
import { Plus, Trash2, Eye, EyeOff, Layout, Image as ImageIcon, Type, Compass, Share2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitch } from "@/shared/components/liyon";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { uploadLogoAction } from "@/features/identity/actions";
import type { HeroSettings, HeroNavLink, HeroSocialLink } from "@/features/identity";

interface HeroSettingsTabProps {
  value: HeroSettings;
  onChange: (value: HeroSettings) => void;
}

export function HeroSettingsTab({ value, onChange }: HeroSettingsTabProps) {
  const [uploadingBg, setUploadingBg] = React.useState(false);
  const bgInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to update shallow properties
  const update = <K extends keyof HeroSettings>(key: K, val: HeroSettings[K]) => {
    onChange({ ...value, [key]: val });
  };

  // Nav link operations
  const addNavLink = () => {
    const newLink: HeroNavLink = {
      id: `link-${Date.now()}`,
      labelTh: "เมนูใหม่",
      labelEn: "NEW LINK",
      href: "/portal",
      enabled: true,
    };
    update("header", {
      ...value.header,
      navLinks: [...value.header.navLinks, newLink],
    });
  };

  const updateNavLink = (id: string, patch: Partial<HeroNavLink>) => {
    update("header", {
      ...value.header,
      navLinks: value.header.navLinks.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  };

  const removeNavLink = (id: string) => {
    update("header", {
      ...value.header,
      navLinks: value.header.navLinks.filter((l) => l.id !== id),
    });
  };

  // Social link operations
  const addSocialLink = () => {
    const newSocial: HeroSocialLink = {
      id: `social-${Date.now()}`,
      label: "SOCIAL",
      href: "https://",
      enabled: true,
    };
    update("footerRail", {
      ...value.footerRail,
      socialLinks: [...value.footerRail.socialLinks, newSocial],
    });
  };

  const updateSocialLink = (id: string, patch: Partial<HeroSocialLink>) => {
    update("footerRail", {
      ...value.footerRail,
      socialLinks: value.footerRail.socialLinks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const removeSocialLink = (id: string) => {
    update("footerRail", {
      ...value.footerRail,
      socialLinks: value.footerRail.socialLinks.filter((s) => s.id !== id),
    });
  };

  // Background Image Upload
  async function handleBgFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);

    setUploadingBg(true);
    try {
      const res = await uploadLogoAction(formData);
      if (res.ok) {
        update("bgImageUrl", res.data.url);
        toast.success("อัปโหลดภาพพื้นหลังสำเร็จ");
      } else {
        toast.error("อัปโหลดภาพไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดภาพ");
    } finally {
      setUploadingBg(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── CARD 1: การจัดวางเลย์เอาต์ & โครงสร้าง ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">1. การจัดวางเลย์เอาต์ (Layout & Display)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {value.enabled ? "เปิดแสดงผล Section" : "ปิดแสดงผล Section"}
            </span>
            <LiyonSwitch
              checked={value.enabled}
              onCheckedChange={(checked) => update("enabled", checked)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiyonField label="สไตล์เลย์เอาต์ (Layout Style)" hint="รูปแบบการจัดวางองค์ประกอบหลัก">
            <LiyonSelect
              value={value.layout}
              onChange={(e) => update("layout", e.target.value as HeroSettings["layout"])}
            >
              <option value="center-motion">Studio Center Motion (ค่าเริ่มต้น - ศิลป์ 3D ตรงกลาง)</option>
              <option value="split">Studio Split (ข้อความฝั่งซ้าย ภาพฝั่งขวา)</option>
              <option value="minimal">Minimalist (เรียบหรู เน้นภาพพื้นหลัง & Typography)</option>
            </LiyonSelect>
          </LiyonField>

          <LiyonField label="ความสูงของ Section (Height)" hint="ความสูงเทียบกับหน้าจอผู้ใช้">
            <LiyonSelect
              value={value.heightMode}
              onChange={(e) => update("heightMode", e.target.value as HeroSettings["heightMode"])}
            >
              <option value="screen-90">เกือบเต็มจอ (90vh - เห็นบริการสำคัญด้านล่างเล็กน้อย)</option>
              <option value="full">เต็มจอพอดี (100vh Full Screen Impact)</option>
              <option value="compact">กะทัดรัด (80vh Compact Studio)</option>
            </LiyonSelect>
          </LiyonField>
        </div>
      </LiyonCard>

      {/* ── CARD 2: ภาพพื้นหลัง & งานศิลป์ 3D Motion ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">2. ภาพและสื่อ (Media & 3D Motion Artwork)</h2>
        </div>

        <div className="space-y-4">
          {/* Background Image */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">ภาพพื้นหลังฉากหลัง (Background Image)</label>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="เช่น /buddhist-hero-bg.jpg หรือ URL รูปภาพ"
                value={value.bgImageUrl ?? ""}
                onChange={(e) => update("bgImageUrl", e.target.value)}
                className="flex-1"
              />
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBgFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploadingBg}
                onClick={() => bgInputRef.current?.click()}
                className="shrink-0 flex items-center gap-2 cursor-pointer"
              >
                {uploadingBg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>{uploadingBg ? "กำลังอัปโหลด..." : "อัปโหลดภาพ"}</span>
              </Button>
            </div>
            {value.bgImageUrl && (
              <div className="h-20 w-40 rounded-lg border overflow-hidden bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.bgImageUrl} alt="Background preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <LiyonField label="ระดับความโปร่งใสเริ่มต้น (Default Blend)" hint="ความชัดเจนของภาพพื้นหลัง">
              <LiyonSelect
                value={value.bgModeDefault}
                onChange={(e) => update("bgModeDefault", e.target.value as HeroSettings["bgModeDefault"])}
              >
                <option value="subtle">กลมกลืนสตูดิโอ Subtle (25% - สบายตา)</option>
                <option value="vivid">เห็นภาพเด่นชัด Vivid (60% - สดใส)</option>
                <option value="minimal">บรรยากาศสตูดิโอล้วน Minimal (0%)</option>
                <option value="hidden">ปิดการแสดงภาพพื้นหลัง (Hidden)</option>
              </LiyonSelect>
            </LiyonField>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 mt-6">
              <div>
                <p className="text-sm font-semibold">ปุ่มสลับระดับภาพพื้นหลัง</p>
                <p className="text-xs text-muted-foreground">อนุญาตให้ผู้เข้าชมกดปุ่มปรับความชัดของภาพเอง</p>
              </div>
              <LiyonSwitch
                checked={value.showBgToggle}
                onCheckedChange={(checked) => update("showBgToggle", checked)}
              />
            </div>
          </div>

          {/* 3D Motion Artwork */}
          <div className="border-t pt-4 mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">งานศิลป์ 3D Cinematic Motion Artwork</p>
                <p className="text-xs text-muted-foreground">แอนิเมชัน 3D ลูป 30 FPS สไตล์ EMBER.dsgn</p>
              </div>
              <LiyonSwitch
                checked={value.showMotionArtwork}
                onCheckedChange={(checked) => update("showMotionArtwork", checked)}
              />
            </div>

            {value.showMotionArtwork && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <LiyonField label="URL ไฟล์ WebP/Animation" hint="ไฟล์หลักที่ใช้เล่นแอนิเมชัน">
                  <input
                    type="text"
                    value={value.motionArtworkUrl ?? ""}
                    onChange={(e) => update("motionArtworkUrl", e.target.value)}
                    placeholder="/ember_animation_30fps.webp"
                  />
                </LiyonField>
                <LiyonField label="URL ไฟล์ GIF สำรอง" hint="Fallback สำหรับอุปกรณ์รุ่นเก่า">
                  <input
                    type="text"
                    value={value.motionPreviewUrl ?? ""}
                    onChange={(e) => update("motionPreviewUrl", e.target.value)}
                    placeholder="/ember_preview.gif"
                  />
                </LiyonField>
              </div>
            )}
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 3: Typography สตูดิโอ & แถลงการณ์ (Manifesto) ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <Type className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">3. Typography ระดับสตูดิโอ & ปณิธาน (Studio Typography)</h2>
        </div>

        <div className="space-y-5">
          {/* Top Giant Mask Typography */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">ข้อความตัวโตด้านบน (Top Giant Mask Typography)</p>
                <p className="text-xs text-muted-foreground">ตัวอักษร Mask โปร่งแสงขนาดใหญ่ เช่น &ldquo;EMBER&rdquo; (คลิกได้)</p>
              </div>
              <LiyonSwitch
                checked={value.topTypography.enabled}
                onCheckedChange={(checked) =>
                  update("topTypography", { ...value.topTypography, enabled: checked })
                }
              />
            </div>
            {value.topTypography.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <LiyonField label="ข้อความตัวโต">
                  <input
                    type="text"
                    value={value.topTypography.text}
                    onChange={(e) =>
                      update("topTypography", { ...value.topTypography, text: e.target.value })
                    }
                    placeholder="EMBER"
                  />
                </LiyonField>
                <LiyonField label="ลิงก์ปลายทางเมื่อคลิก">
                  <input
                    type="text"
                    value={value.topTypography.linkHref ?? ""}
                    onChange={(e) =>
                      update("topTypography", { ...value.topTypography, linkHref: e.target.value })
                    }
                    placeholder="/portal/news"
                  />
                </LiyonField>
              </div>
            )}
          </div>

          {/* Bottom Watermark Typography */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">ลายน้ำตัวโตมุมล่าง (Bottom Watermark Typography)</p>
                <p className="text-xs text-muted-foreground">ลายน้ำศิลปะสไตล์สตูดิโอ เช่น &ldquo;STUDIO&rdquo; ที่มุมขวาล่าง</p>
              </div>
              <LiyonSwitch
                checked={value.bottomWatermark.enabled}
                onCheckedChange={(checked) =>
                  update("bottomWatermark", { ...value.bottomWatermark, enabled: checked })
                }
              />
            </div>
            {value.bottomWatermark.enabled && (
              <LiyonField label="ข้อความลายน้ำ">
                <input
                  type="text"
                  value={value.bottomWatermark.text}
                  onChange={(e) =>
                    update("bottomWatermark", { ...value.bottomWatermark, text: e.target.value })
                  }
                  placeholder="STUDIO"
                />
              </LiyonField>
            )}
          </div>

          {/* Manifesto / About Card */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">การ์ดปณิธาน / แถลงการณ์ (Manifesto / About Card)</p>
                <p className="text-xs text-muted-foreground">กล่องแก้ว Glassmorphism แสดงวิสัยทัศน์กลางจอ</p>
              </div>
              <LiyonSwitch
                checked={value.manifesto.enabled}
                onCheckedChange={(checked) =>
                  update("manifesto", { ...value.manifesto, enabled: checked })
                }
              />
            </div>
            {value.manifesto.enabled && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiyonField label="ป้ายกำกับ (ภาษาไทย)">
                    <input
                      type="text"
                      value={value.manifesto.badgeTextTh}
                      onChange={(e) =>
                        update("manifesto", { ...value.manifesto, badgeTextTh: e.target.value })
                      }
                      placeholder="เกี่ยวกับเรา"
                    />
                  </LiyonField>
                  <LiyonField label="ป้ายกำกับ (ภาษาอังกฤษ)">
                    <input
                      type="text"
                      value={value.manifesto.badgeTextEn}
                      onChange={(e) =>
                        update("manifesto", { ...value.manifesto, badgeTextEn: e.target.value })
                      }
                      placeholder="ABOUT"
                    />
                  </LiyonField>
                </div>
                <LiyonField label="ข้อความปณิธาน (ภาษาไทย)" hint="แสดงเมื่อเปิดโหมดภาษาไทย">
                  <textarea
                    rows={3}
                    value={value.manifesto.bodyTh}
                    onChange={(e) =>
                      update("manifesto", { ...value.manifesto, bodyTh: e.target.value })
                    }
                    className="w-full rounded-md border p-2 text-sm bg-background"
                  />
                </LiyonField>
                <LiyonField label="ข้อความปณิธาน (ภาษาอังกฤษ)" hint="แสดงเมื่อเปิดโหมดภาษาอังกฤษ">
                  <textarea
                    rows={3}
                    value={value.manifesto.bodyEn}
                    onChange={(e) =>
                      update("manifesto", { ...value.manifesto, bodyEn: e.target.value })
                    }
                    className="w-full rounded-md border p-2 text-sm bg-background"
                  />
                </LiyonField>
              </div>
            )}
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 4: แถบเมนูหัวเว็บ (EMBER.dsgn Header) ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <Compass className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">4. แถบเมนูหัวเว็บ (EMBER.dsgn Header Navigation)</h2>
        </div>

        <div className="space-y-4">
          {/* Quick Visibility Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl border bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">แสดงโลโก้</span>
              <LiyonSwitch
                checked={value.header.showLogo}
                onCheckedChange={(c) => update("header", { ...value.header, showLogo: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">แสดงชื่อแบรนด์</span>
              <LiyonSwitch
                checked={value.header.showBrandText}
                onCheckedChange={(c) => update("header", { ...value.header, showBrandText: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">ปุ่มเปลี่ยนภาษา (TH/EN)</span>
              <LiyonSwitch
                checked={value.header.showLanguageSwitcher}
                onCheckedChange={(c) => update("header", { ...value.header, showLanguageSwitcher: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">ปุ่มโหมดมืด/สว่าง</span>
              <LiyonSwitch
                checked={value.header.showThemeToggle}
                onCheckedChange={(c) => update("header", { ...value.header, showThemeToggle: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">ปุ่ม Avatar Menu (Staff)</span>
              <LiyonSwitch
                checked={value.header.showAvatarMenu}
                onCheckedChange={(c) => update("header", { ...value.header, showAvatarMenu: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">ปุ่ม Contact Pill</span>
              <LiyonSwitch
                checked={value.header.contactPill.enabled}
                onCheckedChange={(c) =>
                  update("header", {
                    ...value.header,
                    contactPill: { ...value.header.contactPill, enabled: c },
                  })
                }
              />
            </div>
          </div>

          {/* Contact Pill Details */}
          {value.header.contactPill.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border bg-muted/10">
              <LiyonField label="ข้อความ Contact (TH)">
                <input
                  type="text"
                  value={value.header.contactPill.labelTh}
                  onChange={(e) =>
                    update("header", {
                      ...value.header,
                      contactPill: { ...value.header.contactPill, labelTh: e.target.value },
                    })
                  }
                  placeholder="ติดต่อเรา"
                />
              </LiyonField>
              <LiyonField label="ข้อความ Contact (EN)">
                <input
                  type="text"
                  value={value.header.contactPill.labelEn}
                  onChange={(e) =>
                    update("header", {
                      ...value.header,
                      contactPill: { ...value.header.contactPill, labelEn: e.target.value },
                    })
                  }
                  placeholder="CONTACTS"
                />
              </LiyonField>
              <LiyonField label="ลิงก์ปลายทาง">
                <input
                  type="text"
                  value={value.header.contactPill.href}
                  onChange={(e) =>
                    update("header", {
                      ...value.header,
                      contactPill: { ...value.header.contactPill, href: e.target.value },
                    })
                  }
                  placeholder="/portal/documents"
                />
              </LiyonField>
            </div>
          )}

          {/* Navigation Links Table with Add / Edit / Delete / Toggle */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">รายการเมนูนำทาง (Header Navigation Links)</h3>
                <p className="text-xs text-muted-foreground">ลิงก์ที่มีจุดสีส้มนำหน้าบนแถบเมนูด้านบน</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNavLink}
                className="cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มเมนูนำทาง</span>
              </Button>
            </div>

            <div className="space-y-2">
              {value.header.navLinks.map((link, index) => (
                <div
                  key={link.id}
                  className={cn(
                    "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border transition-all",
                    link.enabled ? "bg-background" : "bg-muted/40 opacity-60"
                  )}
                >
                  <span className="text-xs font-mono font-bold text-muted-foreground w-6 text-center shrink-0 hidden sm:inline">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={link.labelTh}
                    onChange={(e) => updateNavLink(link.id, { labelTh: e.target.value })}
                    placeholder="ชื่อเมนูภาษาไทย"
                    className="flex-1 text-sm font-medium"
                  />
                  <input
                    type="text"
                    value={link.labelEn}
                    onChange={(e) => updateNavLink(link.id, { labelEn: e.target.value })}
                    placeholder="ชื่อเมนูภาษาอังกฤษ"
                    className="flex-1 text-sm font-medium"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateNavLink(link.id, { href: e.target.value })}
                    placeholder="URL (เช่น /portal/news)"
                    className="flex-1 text-sm font-mono"
                  />
                  <div className="flex items-center gap-1 shrink-0 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateNavLink(link.id, { enabled: !link.enabled })}
                      title={link.enabled ? "คลิกเพื่อซ่อน" : "คลิกเพื่อแสดง"}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      {link.enabled ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNavLink(link.id)}
                      title="ลบเมนูนี้"
                      className="cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {value.header.navLinks.length === 0 && (
                <div className="text-center py-6 border border-dashed rounded-xl text-muted-foreground text-xs">
                  ยังไม่มีเมนูนำทาง กรุณากดปุ่ม &ldquo;เพิ่มเมนูนำทาง&rdquo; ด้านบน
                </div>
              )}
            </div>
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 5: แถบข้อมูลด้านล่าง (Footer Rail) ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">5. แถบข้อมูลด้านล่าง (Hero Footer Rail)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {value.footerRail.enabled ? "เปิดแสดง Footer Rail" : "ปิดแสดง Footer Rail"}
            </span>
            <LiyonSwitch
              checked={value.footerRail.enabled}
              onCheckedChange={(c) => update("footerRail", { ...value.footerRail, enabled: c })}
            />
          </div>
        </div>

        {value.footerRail.enabled && (
          <div className="space-y-5">
            {/* CTA Button */}
            <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">ปุ่มสำรวจผลงาน / แอ็กชัน (CTA Explore Button)</p>
                  <p className="text-xs text-muted-foreground">ปุ่มวงรีที่มุมซ้ายล่าง เช่น &ldquo;EXPLORE OUR WORK&rdquo;</p>
                </div>
                <LiyonSwitch
                  checked={value.footerRail.ctaButton.enabled}
                  onCheckedChange={(c) =>
                    update("footerRail", {
                      ...value.footerRail,
                      ctaButton: { ...value.footerRail.ctaButton, enabled: c },
                    })
                  }
                />
              </div>

              {value.footerRail.ctaButton.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <LiyonField label="ข้อความด้านบน (Eyebrow)">
                    <input
                      type="text"
                      value={value.footerRail.ctaButton.eyebrow}
                      onChange={(e) =>
                        update("footerRail", {
                          ...value.footerRail,
                          ctaButton: { ...value.footerRail.ctaButton, eyebrow: e.target.value },
                        })
                      }
                      placeholder="DOUBLE CLICK AND"
                    />
                  </LiyonField>
                  <LiyonField label="ข้อความปุ่ม (TH / EN)">
                    <input
                      type="text"
                      value={value.footerRail.ctaButton.labelEn}
                      onChange={(e) =>
                        update("footerRail", {
                          ...value.footerRail,
                          ctaButton: { ...value.footerRail.ctaButton, labelEn: e.target.value },
                        })
                      }
                      placeholder="EXPLORE OUR WORK"
                    />
                  </LiyonField>
                  <LiyonField label="ลิงก์ปลายทาง">
                    <input
                      type="text"
                      value={value.footerRail.ctaButton.href}
                      onChange={(e) =>
                        update("footerRail", {
                          ...value.footerRail,
                          ctaButton: { ...value.footerRail.ctaButton, href: e.target.value },
                        })
                      }
                      placeholder="/portal/programs"
                    />
                  </LiyonField>
                </div>
              )}
            </div>

            {/* Social Links with Add / Edit / Delete / Toggle */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">โซเชียลมีเดียลิงก์ (Social Links)</h3>
                  <p className="text-xs text-muted-foreground">ลิงก์โซเชียลตรงกลางแถบด้านล่าง (เช่น FACEBOOK, INSTAGRAM)</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  className="cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มโซเชียลลิงก์</span>
                </Button>
              </div>

              <div className="space-y-2">
                {value.footerRail.socialLinks.map((social) => (
                  <div
                    key={social.id}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border transition-all",
                      social.enabled ? "bg-background" : "bg-muted/40 opacity-60"
                    )}
                  >
                    <input
                      type="text"
                      value={social.label}
                      onChange={(e) => updateSocialLink(social.id, { label: e.target.value })}
                      placeholder="ชื่อแพลตฟอร์ม (เช่น FACEBOOK)"
                      className="w-1/3 text-sm font-bold uppercase"
                    />
                    <input
                      type="text"
                      value={social.href}
                      onChange={(e) => updateSocialLink(social.id, { href: e.target.value })}
                      placeholder="URL ลิงก์ (https://...)"
                      className="flex-1 text-sm font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSocialLink(social.id, { enabled: !social.enabled })}
                      title={social.enabled ? "คลิกเพื่อซ่อน" : "คลิกเพื่อแสดง"}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      {social.enabled ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocialLink(social.id)}
                      title="ลบลิงก์นี้"
                      className="cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {value.footerRail.socialLinks.length === 0 && (
                  <div className="text-center py-4 border border-dashed rounded-xl text-muted-foreground text-xs">
                    ยังไม่มีโซเชียลมีเดียลิงก์ กรุณากดปุ่ม &ldquo;เพิ่มโซเชียลลิงก์&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Location Text */}
            <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">ข้อมูลที่ตั้งและพิกัด (Location & Address)</p>
                  <p className="text-xs text-muted-foreground">แสดงที่มุมขวาล่างของแถบ Footer Rail</p>
                </div>
                <LiyonSwitch
                  checked={value.footerRail.locationText.enabled}
                  onCheckedChange={(c) =>
                    update("footerRail", {
                      ...value.footerRail,
                      locationText: { ...value.footerRail.locationText, enabled: c },
                    })
                  }
                />
              </div>

              {value.footerRail.locationText.enabled && (
                <LiyonField label="ข้อความที่อยู่/พิกัด">
                  <input
                    type="text"
                    value={value.footerRail.locationText.address ?? ""}
                    onChange={(e) =>
                      update("footerRail", {
                        ...value.footerRail,
                        locationText: { ...value.footerRail.locationText, address: e.target.value },
                      })
                    }
                    placeholder="WANG NOI, AYUTTHAYA 13170, THAILAND"
                  />
                </LiyonField>
              )}
            </div>
          </div>
        )}
      </LiyonCard>
    </div>
  );
}
