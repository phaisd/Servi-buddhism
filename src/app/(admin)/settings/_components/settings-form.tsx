"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon, Building, Sparkles, Grid, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";
import type { PaletteId } from "@/shared/lib/palette";
import {
  DEFAULT_HERO_SETTINGS,
  DEFAULT_SERVICES_SECTION_SETTINGS,
  DEFAULT_NEWS_SECTION_SETTINGS,
  DEFAULT_FACULTY_BANNER_SETTINGS,
  type TenantSettings,
} from "@/features/identity";
import { updateSettingsAction, uploadLogoAction } from "@/features/identity/actions";
import { HeroSettingsTab } from "./hero-settings-tab";
import { ServicesSettingsTab } from "./services-settings-tab";
import { PortalContentSettingsTab } from "./portal-content-settings-tab";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"general" | "hero" | "services" | "content">("general");
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    hero: initial.hero ?? DEFAULT_HERO_SETTINGS,
    servicesSection: initial.servicesSection ?? DEFAULT_SERVICES_SECTION_SETTINGS,
    newsSection: initial.newsSection ?? DEFAULT_NEWS_SECTION_SETTINGS,
    facultyBanner: initial.facultyBanner ?? DEFAULT_FACULTY_BANNER_SETTINGS,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFile(file: File) {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ PNG, JPEG, WebP และ SVG เท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await uploadLogoAction(formData);
      if (res.ok) {
        setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
        toast.success(t("settings.uploadSuccess"));
      } else {
        toast.error(res.error.fieldErrors?.file?.[0] ?? t("settings.uploadError"));
      }
    } catch {
      toast.error(t("settings.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    void uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) { setErrors(r.error.fieldErrors ?? {}); if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`)); return; }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 mb-6 px-1 max-w-5xl">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-px",
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building className="w-4 h-4" />
          <span>ข้อมูลองค์กร & แบรนด์</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-px",
            activeTab === "hero"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>ปรับแต่ง Hero Section (หน้าแรก Portal)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-px",
            activeTab === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Grid className="w-4 h-4" />
          <span>บริการสำคัญ & หลักสูตร (Quick Services)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-px",
            activeTab === "content"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Newspaper className="w-4 h-4" />
          <span>ข่าวสาร & แบนเนอร์คณาจารย์</span>
        </button>
      </div>

      <div className="set-cards">
        {activeTab === "hero" ? (
          <HeroSettingsTab
            value={form.hero}
            onChange={(h) => setForm((prev) => ({ ...prev, hero: h }))}
          />
        ) : activeTab === "services" ? (
          <ServicesSettingsTab
            value={form.servicesSection}
            onChange={(s) => setForm((prev) => ({ ...prev, servicesSection: s }))}
          />
        ) : activeTab === "content" ? (
          <PortalContentSettingsTab
            newsValue={form.newsSection}
            onNewsChange={(n) => setForm((prev) => ({ ...prev, newsSection: n }))}
            bannerValue={form.facultyBanner}
            onBannerChange={(b) => setForm((prev) => ({ ...prev, facultyBanner: b }))}
          />
        ) : (
          <>
            <LiyonCard>
              <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            
            <div className="space-y-4">
              {/* กล่องอัปโหลดโลโก้ (เหนือช่อง URL) */}
              <div className="field">
                <label>{t("settings.uploadLogo")}</label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!uploading) fileInputRef.current?.click();
                  }}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center",
                    isDragging
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]"
                      : "border-border/80 hover:border-primary/60 hover:bg-muted/40 bg-muted/20",
                    uploading && "opacity-75 pointer-events-none"
                  )}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-foreground">{t("settings.uploading")}</p>
                    </div>
                  ) : form.logoUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full p-1" onClick={(e) => e.stopPropagation()}>
                      <div className="h-20 w-20 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden p-2 shadow-sm shrink-0">
                        <img
                          src={form.logoUrl}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{t("settings.logoPreview")}</span>
                          <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-md font-medium">{t("settings.readyToUse")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{form.logoUrl}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("settings.dropToReplaceHint")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-1.5" />
                          <span>{t("settings.changeLogo")}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((prev) => ({ ...prev, logoUrl: "" }));
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title={t("settings.removeLogo")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          <span>{t("settings.removeLogo")}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {isDragging ? t("settings.dropzoneActive") : t("settings.dropzonePrompt")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.dropzoneHint")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ช่อง URL โลโก้ อยู่ด้านล่างกล่องอัปโหลด */}
              <LiyonField
                label={t("settings.logoUrl")}
                htmlFor="s-logo"
                hint={t("common.optional")}
                error={errors.logoUrl?.[0]}
              >
                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรืออัปโหลดจากกล่องด้านบน"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        </>
        )}
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}
