"use client";

import * as React from "react";
import {
  BookOpen,
  Video,
  Award,
  FileText,
  GraduationCap,
  Calendar,
  Users,
  Globe,
  Sparkles,
  Clock,
  Heart,
  ShieldCheck,
  Grid,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitch } from "@/shared/components/liyon";
import { cn } from "@/shared/lib/utils";
import type { ServicesSectionSettings, ServiceItem } from "@/features/identity";

export const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Video,
  Award,
  FileText,
  GraduationCap,
  Calendar,
  Users,
  Globe,
  Sparkles,
  Clock,
  Heart,
  ShieldCheck,
};

const ICON_OPTIONS = [
  { value: "BookOpen", label: "BookOpen (หลักสูตร / หนังสือ)" },
  { value: "Video", label: "Video (ห้องประชุม / การประชุมออนไลน์)" },
  { value: "Award", label: "Award (คำร้อง / ใบรับรอง / รางวัล)" },
  { value: "FileText", label: "FileText (คลังเอกสาร / แบบฟอร์ม)" },
  { value: "GraduationCap", label: "GraduationCap (การศึกษา / งานวิชาการ)" },
  { value: "Calendar", label: "Calendar (ปฏิทิน / กิจกรรม)" },
  { value: "Users", label: "Users (บุคลากร / นิสิต)" },
  { value: "Globe", label: "Globe (เว็บไซต์ / บริการภายนอก)" },
  { value: "Sparkles", label: "Sparkles (บริการพิเศษ / แนะนำ)" },
  { value: "Clock", label: "Clock (กำหนดการ / เวลาทำการ)" },
  { value: "Heart", label: "Heart (สวัสดิการ / กิจกรรมจิตอาสา)" },
  { value: "ShieldCheck", label: "ShieldCheck (ความปลอดภัย / ตรวจสอบ)" },
];

interface ServicesSettingsTabProps {
  value: ServicesSectionSettings;
  onChange: (value: ServicesSectionSettings) => void;
}

export function ServicesSettingsTab({ value, onChange }: ServicesSettingsTabProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const update = <K extends keyof ServicesSectionSettings>(
    key: K,
    val: ServicesSectionSettings[K]
  ) => {
    onChange({ ...value, [key]: val });
  };

  const addCard = () => {
    const newId = `service-${Date.now()}`;
    const newCard: ServiceItem = {
      id: newId,
      titleTh: "บริการใหม่",
      titleEn: "New Service",
      descTh: "รายละเอียดและคำอธิบายการให้บริการสำหรับนิสิตและบุคลากร",
      descEn: "Service description and general guidelines",
      href: "/portal",
      icon: "Sparkles",
      badgeTh: "บริการใหม่",
      badgeEn: "New",
      enabled: true,
    };
    update("items", [...value.items, newCard]);
    setExpandedId(newId);
  };

  const updateCard = (id: string, patch: Partial<ServiceItem>) => {
    update(
      "items",
      value.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeCard = (id: string) => {
    update(
      "items",
      value.items.filter((item) => item.id !== id)
    );
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* ── CARD 1: การตั้งค่าหัวข้อ Section ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">1. หัวข้อและแถบภาพรวม (Section Header)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {value.enabled ? "เปิดแสดง Section นี้" : "ปิดแสดง Section นี้"}
            </span>
            <LiyonSwitch
              checked={value.enabled}
              onCheckedChange={(checked) => update("enabled", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="ป้ายกำกับด้านบน (TH)" hint="เช่น บริการสำคัญ, จุดบริการนิสิต">
              <input
                type="text"
                className="input"
                value={value.eyebrowTh}
                onChange={(e) => update("eyebrowTh", e.target.value)}
                placeholder="บริการสำคัญ"
              />
            </LiyonField>
            <LiyonField label="ป้ายกำกับด้านบน (EN)" hint="เช่น Core Services, Quick Access">
              <input
                type="text"
                className="input"
                value={value.eyebrowEn}
                onChange={(e) => update("eyebrowEn", e.target.value)}
                placeholder="Core Services"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="หัวข้อหลัก (TH)" hint="หัวข้อใหญ่ประจำ Section">
              <input
                type="text"
                className="input"
                value={value.titleTh}
                onChange={(e) => update("titleTh", e.target.value)}
                placeholder="ระบบบริการการศึกษาและสารสนเทศ"
              />
            </LiyonField>
            <LiyonField label="หัวข้อหลัก (EN)">
              <input
                type="text"
                className="input"
                value={value.titleEn}
                onChange={(e) => update("titleEn", e.target.value)}
                placeholder="Academic & Information Services"
              />
            </LiyonField>
          </div>

          {/* View All Button Controls */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">ปุ่มดูบริการทั้งหมด (View All Link)</p>
                <p className="text-xs text-muted-foreground">ปุ่มลิงก์มุมขวาบนของ Section</p>
              </div>
              <LiyonSwitch
                checked={value.showViewAll}
                onCheckedChange={(checked) => update("showViewAll", checked)}
              />
            </div>

            {value.showViewAll && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                <LiyonField label="ข้อความปุ่ม (TH)">
                  <input
                    type="text"
                    className="input"
                    value={value.viewAllTextTh}
                    onChange={(e) => update("viewAllTextTh", e.target.value)}
                    placeholder="ดูบริการทั้งหมด"
                  />
                </LiyonField>
                <LiyonField label="ข้อความปุ่ม (EN)">
                  <input
                    type="text"
                    className="input"
                    value={value.viewAllTextEn}
                    onChange={(e) => update("viewAllTextEn", e.target.value)}
                    placeholder="View All"
                  />
                </LiyonField>
                <LiyonField label="URL ปลายทาง">
                  <input
                    type="text"
                    className="input font-mono text-xs"
                    value={value.viewAllHref}
                    onChange={(e) => update("viewAllHref", e.target.value)}
                    placeholder="/portal/programs"
                  />
                </LiyonField>
              </div>
            )}
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 2: การ์ดบริการสำคัญ (Quick Service Cards CRUD) ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h2 className="text-lg font-bold">2. รายการการ์ดบริการสำคัญ (Service Cards)</h2>
            <p className="text-xs text-muted-foreground">
              เพิ่ม แก้ไข ลบ หรือเปิด/ปิดการแสดงผลการ์ดบริการที่จะปรากฏบนหน้าแรก
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addCard}
            className="cursor-pointer gap-1.5 font-medium shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการ์ดใหม่</span>
          </Button>
        </div>

        <div className="space-y-3">
          {value.items.map((item, idx) => {
            const IconComp = SERVICE_ICONS[item.icon] || Sparkles;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border transition-all duration-200 overflow-hidden",
                  item.enabled ? "bg-card" : "bg-muted/30 opacity-75",
                  isExpanded ? "ring-2 ring-primary/20 border-primary/40 shadow-xs" : "hover:border-border/80"
                )}
              >
                {/* Header Summary Row */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-muted-foreground w-5 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate">
                          {item.titleTh || item.titleEn || "การ์ดไม่มีชื่อ"}
                        </p>
                        {item.badgeTh && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                            {item.badgeTh}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {item.href || "#"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Visibility Switch */}
                    <button
                      type="button"
                      onClick={() => updateCard(item.id, { enabled: !item.enabled })}
                      className={cn(
                        "p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors flex items-center gap-1",
                        item.enabled
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      )}
                      title={item.enabled ? "กำลังแสดงผล (คลิกเพื่อปิด)" : "ปิดการแสดงผล (คลิกเพื่อเปิด)"}
                    >
                      {item.enabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">แสดง</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">ซ่อน</span>
                        </>
                      )}
                    </button>

                    {/* Expand/Collapse Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(item.id)}
                      className="cursor-pointer gap-1 text-xs"
                    >
                      <span>{isExpanded ? "ย่อ" : "แก้ไข"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </Button>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCard(item.id)}
                      className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive p-1.5 h-8 w-8"
                      title="ลบการ์ดนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isExpanded && (
                  <div className="p-4 border-t bg-muted/15 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LiyonField label="ชื่อบริการ (ภาษาไทย)" hint="หัวข้อการ์ด">
                        <input
                          type="text"
                          className="input"
                          value={item.titleTh}
                          onChange={(e) => updateCard(item.id, { titleTh: e.target.value })}
                          placeholder="เช่น หลักสูตรระดับปริญญา"
                        />
                      </LiyonField>
                      <LiyonField label="ชื่อบริการ (ภาษาอังกฤษ)">
                        <input
                          type="text"
                          className="input"
                          value={item.titleEn}
                          onChange={(e) => updateCard(item.id, { titleEn: e.target.value })}
                          placeholder="Academic Programs"
                        />
                      </LiyonField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LiyonField label="คำอธิบาย (ภาษาไทย)" hint="ข้อความสั้น 1-2 บรรทัด">
                        <textarea
                          rows={2}
                          className="textarea"
                          value={item.descTh}
                          onChange={(e) => updateCard(item.id, { descTh: e.target.value })}
                          placeholder="คำอธิบายบริการ"
                        />
                      </LiyonField>
                      <LiyonField label="คำอธิบาย (ภาษาอังกฤษ)">
                        <textarea
                          rows={2}
                          className="textarea"
                          value={item.descEn}
                          onChange={(e) => updateCard(item.id, { descEn: e.target.value })}
                          placeholder="Short description"
                        />
                      </LiyonField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <LiyonField label="URL ปลายทาง" hint="เช่น /portal/programs">
                        <div className="relative">
                          <input
                            type="text"
                            className="input font-mono text-xs pr-8"
                            value={item.href}
                            onChange={(e) => updateCard(item.id, { href: e.target.value })}
                            placeholder="/portal/programs"
                          />
                          <ExternalLink className="w-3.5 h-3.5 absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
                        </div>
                      </LiyonField>

                      <LiyonField label="เลือกไอคอน (Icon)" hint="ไอคอนประจำการ์ด">
                        <LiyonSelect
                          value={item.icon}
                          onChange={(e) => updateCard(item.id, { icon: e.target.value })}
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </LiyonSelect>
                      </LiyonField>

                      <LiyonField label="ป้ายกำกับ (Badge TH)" hint="เช่น เปิดรับสมัคร, บริการออนไลน์">
                        <input
                          type="text"
                          className="input"
                          value={item.badgeTh}
                          onChange={(e) => updateCard(item.id, { badgeTh: e.target.value })}
                          placeholder="เช่น เปิดรับสมัคร"
                        />
                      </LiyonField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <LiyonField label="ป้ายกำกับ (Badge EN)" hint="เช่น Admissions, Online">
                        <input
                          type="text"
                          className="input"
                          value={item.badgeEn}
                          onChange={(e) => updateCard(item.id, { badgeEn: e.target.value })}
                          placeholder="e.g. Admissions"
                        />
                      </LiyonField>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {value.items.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
              <p>ยังไม่มีการ์ดบริการสำคัญ</p>
              <Button type="button" size="sm" onClick={addCard} className="cursor-pointer">
                <Plus className="w-4 h-4 mr-1" />
                <span>เพิ่มการ์ดแรก</span>
              </Button>
            </div>
          )}
        </div>
      </LiyonCard>
    </div>
  );
}
