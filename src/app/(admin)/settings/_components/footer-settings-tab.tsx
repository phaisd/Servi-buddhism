"use client";

import * as React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Info,
  ShieldCheck,
  PanelBottom,
} from "lucide-react";
import { LiyonCard, LiyonField, LiyonSwitch } from "@/shared/components/liyon";
import type { FooterSettings } from "@/features/identity";

interface FooterSettingsTabProps {
  value: FooterSettings;
  onChange: (value: FooterSettings) => void;
}

export function FooterSettingsTab({ value, onChange }: FooterSettingsTabProps) {
  const update = <K extends keyof FooterSettings>(key: K, val: FooterSettings[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* ── CARD 1: ข้อมูลการติดต่อ & ที่ตั้งสำนักงาน ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PanelBottom className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">1. สถานะและการแสดงผลท้ายเว็บ (Footer Display)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {value.enabled ? "เปิดแสดง Footer ท้ายเว็บ" : "ปิดแสดง Footer ท้ายเว็บ"}
            </span>
            <LiyonSwitch
              checked={value.enabled}
              onCheckedChange={(checked) => update("enabled", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
            <div className="space-y-0.5">
              <div className="text-sm font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>แสดงปุ่มเข้าระบบสำหรับเจ้าหน้าที่ (Staff Console)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                แสดงปุ่มทางลัดเข้าสู่ระบบหลังบ้านสำหรับบุคลากรใน Footer และแถบล่างสุด
              </p>
            </div>
            <LiyonSwitch
              checked={value.showStaffConsole}
              onCheckedChange={(checked) => update("showStaffConsole", checked)}
            />
          </div>

          <div className="space-y-4 pt-2">
            <LiyonField
              label="คำอธิบายองค์กร / ปณิธานสังเขป (TH)"
              hint="ข้อความแนะนำองค์กรใต้โลโก้ฝั่งซ้ายของ Footer"
            >
              <textarea
                className="input min-h-[72px] resize-y"
                value={value.descTh}
                onChange={(e) => update("descTh", e.target.value)}
                rows={3}
              />
            </LiyonField>

            <LiyonField
              label="คำอธิบายองค์กร / ปณิธานสังเขป (EN)"
              hint="Mission & About description under logo in English"
            >
              <textarea
                className="input min-h-[72px] resize-y"
                value={value.descEn}
                onChange={(e) => update("descEn", e.target.value)}
                rows={3}
              />
            </LiyonField>
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 2: ข้อมูลติดต่อ (Contact Information) ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">2. ช่องทางการติดต่อและที่อยู่ (Contact Details)</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField
              label="เบอร์โทรศัพท์ติดต่อ"
              hint="เช่น 035-248-000 ต่อ 8100-8104"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  className="input pl-9"
                  value={value.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="035-248-000"
                />
              </div>
            </LiyonField>

            <LiyonField
              label="อีเมลติดต่อหลัก"
              hint="เช่น buddhist@mcu.ac.th"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  className="input pl-9"
                  value={value.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="buddhist@mcu.ac.th"
                />
              </div>
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField
              label="ที่อยู่สำนักงาน / คณะ (TH)"
              hint="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
            >
              <textarea
                className="input min-h-[64px] resize-y"
                value={value.addressTh}
                onChange={(e) => update("addressTh", e.target.value)}
                rows={2}
              />
            </LiyonField>

            <LiyonField
              label="ที่อยู่สำนักงาน / คณะ (EN)"
              hint="Office Address in English"
            >
              <textarea
                className="input min-h-[64px] resize-y"
                value={value.addressEn}
                onChange={(e) => update("addressEn", e.target.value)}
                rows={2}
              />
            </LiyonField>
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 3: คอลัมน์และลิงก์ภายนอก ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">3. คอลัมน์ลิงก์ & ลิงก์มหาวิทยาลัย (Links & Systems)</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="หัวข้อคอลัมน์ที่ 2 (TH)" hint="หัวข้อหมวดเมนูลัด">
              <input
                type="text"
                className="input"
                value={value.quickLinksTitleTh}
                onChange={(e) => update("quickLinksTitleTh", e.target.value)}
              />
            </LiyonField>
            <LiyonField label="หัวข้อคอลัมน์ที่ 2 (EN)">
              <input
                type="text"
                className="input"
                value={value.quickLinksTitleEn}
                onChange={(e) => update("quickLinksTitleEn", e.target.value)}
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="หัวข้อคอลัมน์ที่ 3 (TH)" hint="หัวข้อหมวดระบบสารสนเทศ">
              <input
                type="text"
                className="input"
                value={value.systemsTitleTh}
                onChange={(e) => update("systemsTitleTh", e.target.value)}
              />
            </LiyonField>
            <LiyonField label="หัวข้อคอลัมน์ที่ 3 (EN)">
              <input
                type="text"
                className="input"
                value={value.systemsTitleEn}
                onChange={(e) => update("systemsTitleEn", e.target.value)}
              />
            </LiyonField>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <LiyonField label="URL เว็บไซต์หลัก มหาวิทยาลัย" hint="ลิงก์ภายนอก เช่น https://www.mcu.ac.th">
                  <input
                    type="url"
                    className="input"
                    value={value.mainWebsiteUrl}
                    onChange={(e) => update("mainWebsiteUrl", e.target.value)}
                    placeholder="https://www.mcu.ac.th"
                  />
                </LiyonField>
              </div>
              <div>
                <LiyonField label="ชื่อปุ่มเว็บไซต์หลัก (TH)">
                  <input
                    type="text"
                    className="input"
                    value={value.mainWebsiteTextTh}
                    onChange={(e) => update("mainWebsiteTextTh", e.target.value)}
                  />
                </LiyonField>
              </div>
              <div>
                <LiyonField label="ชื่อปุ่มเว็บไซต์หลัก (EN)">
                  <input
                    type="text"
                    className="input"
                    value={value.mainWebsiteTextEn}
                    onChange={(e) => update("mainWebsiteTextEn", e.target.value)}
                  />
                </LiyonField>
              </div>
            </div>
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 4: แถบล่างสุด & ข้อมูลลิขสิทธิ์ (Footer Bottom Bar) ── */}
      <LiyonCard>
        <div className="flex items-center gap-2 border-b pb-3 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">4. แถบล่างสุด & ลิขสิทธิ์ (Copyright & Bottom Bar)</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField
              label="ชื่อมหาวิทยาลัย / หน่วยงานสังกัด (TH)"
              hint="ต่อท้ายชื่อคณะในบรรทัดลิขสิทธิ์"
            >
              <input
                type="text"
                className="input"
                value={value.subTaglineTh}
                onChange={(e) => update("subTaglineTh", e.target.value)}
              />
            </LiyonField>
            <LiyonField
              label="ชื่อมหาวิทยาลัย / หน่วยงานสังกัด (EN)"
              hint="University / Affiliation in English"
            >
              <input
                type="text"
                className="input"
                value={value.subTaglineEn}
                onChange={(e) => update("subTaglineEn", e.target.value)}
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="ข้อความสงวนลิขสิทธิ์ (TH)" hint="เช่น สงวนลิขสิทธิ์ทั้งหมด">
              <input
                type="text"
                className="input"
                value={value.copyrightTh}
                onChange={(e) => update("copyrightTh", e.target.value)}
              />
            </LiyonField>
            <LiyonField label="ข้อความสงวนลิขสิทธิ์ (EN)" hint="เช่น All rights reserved.">
              <input
                type="text"
                className="input"
                value={value.copyrightEn}
                onChange={(e) => update("copyrightEn", e.target.value)}
              />
            </LiyonField>
          </div>
        </div>
      </LiyonCard>
    </div>
  );
}
