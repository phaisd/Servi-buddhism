"use client";

import * as React from "react";
import { Newspaper, Users } from "lucide-react";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitch } from "@/shared/components/liyon";
import type { NewsSectionSettings, FacultyBannerSettings } from "@/features/identity";

interface PortalContentSettingsTabProps {
  newsValue: NewsSectionSettings;
  onNewsChange: (value: NewsSectionSettings) => void;
  bannerValue: FacultyBannerSettings;
  onBannerChange: (value: FacultyBannerSettings) => void;
}

export function PortalContentSettingsTab({
  newsValue,
  onNewsChange,
  bannerValue,
  onBannerChange,
}: PortalContentSettingsTabProps) {
  const updateNews = <K extends keyof NewsSectionSettings>(
    key: K,
    val: NewsSectionSettings[K]
  ) => {
    onNewsChange({ ...newsValue, [key]: val });
  };

  const updateBanner = <K extends keyof FacultyBannerSettings>(
    key: K,
    val: FacultyBannerSettings[K]
  ) => {
    onBannerChange({ ...bannerValue, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* ── CARD 1: ข่าวสารและประชาสัมพันธ์ (Latest News & Announcements) ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">1. ข่าวสารและประชาสัมพันธ์ (Latest News & Announcements)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {newsValue.enabled ? "เปิดแสดง Section นี้" : "ปิดแสดง Section นี้"}
            </span>
            <LiyonSwitch
              checked={newsValue.enabled}
              onCheckedChange={(checked) => updateNews("enabled", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="ป้ายกำกับด้านบน (TH)" hint="เช่น ประชาสัมพันธ์, ข่าวสารล่าสุด">
              <input
                type="text"
                className="input"
                value={newsValue.eyebrowTh}
                onChange={(e) => updateNews("eyebrowTh", e.target.value)}
                placeholder="ประชาสัมพันธ์"
              />
            </LiyonField>
            <LiyonField label="ป้ายกำกับด้านบน (EN)" hint="เช่น Announcements, Updates">
              <input
                type="text"
                className="input"
                value={newsValue.eyebrowEn}
                onChange={(e) => updateNews("eyebrowEn", e.target.value)}
                placeholder="Announcements"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="หัวข้อหลัก (TH)" hint="หัวข้อใหญ่ประจำ Section ข่าวสาร">
              <input
                type="text"
                className="input"
                value={newsValue.titleTh}
                onChange={(e) => updateNews("titleTh", e.target.value)}
                placeholder="ข่าวสารและกิจกรรมล่าสุด"
              />
            </LiyonField>
            <LiyonField label="หัวข้อหลัก (EN)">
              <input
                type="text"
                className="input"
                value={newsValue.titleEn}
                onChange={(e) => updateNews("titleEn", e.target.value)}
                placeholder="Latest News & Events"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LiyonField label="จำนวนข่าวที่แสดงบนหน้าแรก" hint="เลือกจำนวนการ์ดข่าวสาร">
              <LiyonSelect
                value={String(newsValue.pageSize)}
                onChange={(e) => updateNews("pageSize", Number(e.target.value))}
              >
                <option value="2">2 ข่าว</option>
                <option value="4">4 ข่าว (แนะนำ)</option>
                <option value="6">6 ข่าว</option>
                <option value="8">8 ข่าว</option>
                <option value="12">12 ข่าว</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* View All Button Controls */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">ปุ่มดูข่าวสารทั้งหมด (View All Link)</p>
                <p className="text-xs text-muted-foreground">ปุ่มลิงก์มุมขวาบนของ Section</p>
              </div>
              <LiyonSwitch
                checked={newsValue.showViewAll}
                onCheckedChange={(checked) => updateNews("showViewAll", checked)}
              />
            </div>

            {newsValue.showViewAll && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                <LiyonField label="ข้อความปุ่ม (TH)">
                  <input
                    type="text"
                    className="input"
                    value={newsValue.viewAllTextTh}
                    onChange={(e) => updateNews("viewAllTextTh", e.target.value)}
                    placeholder="ดูข่าวสารทั้งหมด"
                  />
                </LiyonField>
                <LiyonField label="ข้อความปุ่ม (EN)">
                  <input
                    type="text"
                    className="input"
                    value={newsValue.viewAllTextEn}
                    onChange={(e) => updateNews("viewAllTextEn", e.target.value)}
                    placeholder="All News"
                  />
                </LiyonField>
                <LiyonField label="URL ปลายทาง">
                  <input
                    type="text"
                    className="input font-mono text-xs"
                    value={newsValue.viewAllHref}
                    onChange={(e) => updateNews("viewAllHref", e.target.value)}
                    placeholder="/portal/news"
                  />
                </LiyonField>
              </div>
            )}
          </div>
        </div>
      </LiyonCard>

      {/* ── CARD 2: แบนเนอร์คณาจารย์และบุคลากร (Faculty & Community Banner) ── */}
      <LiyonCard>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">2. แบนเนอร์คณาจารย์และบุคลากร (Faculty & Community Banner)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {bannerValue.enabled ? "เปิดแสดง Banner นี้" : "ปิดแสดง Banner นี้"}
            </span>
            <LiyonSwitch
              checked={bannerValue.enabled}
              onCheckedChange={(checked) => updateBanner("enabled", checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="ป้ายกำกับ (Badge TH)" hint="เช่น คณาจารย์ผู้ทรงคุณวุฒิ">
              <input
                type="text"
                className="input"
                value={bannerValue.badgeTh}
                onChange={(e) => updateBanner("badgeTh", e.target.value)}
                placeholder="คณาจารย์ผู้ทรงคุณวุฒิ"
              />
            </LiyonField>
            <LiyonField label="ป้ายกำกับ (Badge EN)" hint="เช่น Distinguished Faculty">
              <input
                type="text"
                className="input"
                value={bannerValue.badgeEn}
                onChange={(e) => updateBanner("badgeEn", e.target.value)}
                placeholder="Distinguished Faculty"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="หัวข้อใหญ่ (TH)">
              <input
                type="text"
                className="input"
                value={bannerValue.headingTh}
                onChange={(e) => updateBanner("headingTh", e.target.value)}
                placeholder="รวมคณาจารย์และนักวิชาการพระพุทธศาสนาระดับโลก"
              />
            </LiyonField>
            <LiyonField label="หัวข้อใหญ่ (EN)">
              <input
                type="text"
                className="input"
                value={bannerValue.headingEn}
                onChange={(e) => updateBanner("headingEn", e.target.value)}
                placeholder="World-Class Buddhist Scholars & Academic Faculty"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="คำบรรยาย (TH)">
              <textarea
                rows={3}
                className="textarea"
                value={bannerValue.descTh}
                onChange={(e) => updateBanner("descTh", e.target.value)}
                placeholder="คำบรรยายคณาจารย์"
              />
            </LiyonField>
            <LiyonField label="คำบรรยาย (EN)">
              <textarea
                rows={3}
                className="textarea"
                value={bannerValue.descEn}
                onChange={(e) => updateBanner("descEn", e.target.value)}
                placeholder="Faculty description"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LiyonField label="ข้อความปุ่ม Action (TH)">
              <input
                type="text"
                className="input"
                value={bannerValue.buttonLabelTh}
                onChange={(e) => updateBanner("buttonLabelTh", e.target.value)}
                placeholder="ทำเนียบคณาจารย์และบุคลากร"
              />
            </LiyonField>
            <LiyonField label="ข้อความปุ่ม Action (EN)">
              <input
                type="text"
                className="input"
                value={bannerValue.buttonLabelEn}
                onChange={(e) => updateBanner("buttonLabelEn", e.target.value)}
                placeholder="View Faculty Directory"
              />
            </LiyonField>
            <LiyonField label="URL ปลายทาง">
              <input
                type="text"
                className="input font-mono text-xs"
                value={bannerValue.buttonHref}
                onChange={(e) => updateBanner("buttonHref", e.target.value)}
                placeholder="/portal/personnel"
              />
            </LiyonField>
          </div>

          {/* 3 Studio Circles */}
          <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">วงกลมกราฟิกสตูดิโอ 3 วง (3 Graphic Circles)</p>
                <p className="text-xs text-muted-foreground">กราฟิกวงกลมสีสัน 3 วงด้านขวาของแบนเนอร์</p>
              </div>
              <LiyonSwitch
                checked={bannerValue.showCircles}
                onCheckedChange={(checked) => updateBanner("showCircles", checked)}
              />
            </div>

            {bannerValue.showCircles && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                <LiyonField label="ข้อความในวงกลม 1 (สีส้ม/ทอง)">
                  <input
                    type="text"
                    className="input font-bold"
                    value={bannerValue.circle1Text}
                    onChange={(e) => updateBanner("circle1Text", e.target.value)}
                    placeholder="MCU"
                  />
                </LiyonField>
                <LiyonField label="ข้อความในวงกลม 2 (สีเขียว/มรกต)">
                  <input
                    type="text"
                    className="input font-bold"
                    value={bannerValue.circle2Text}
                    onChange={(e) => updateBanner("circle2Text", e.target.value)}
                    placeholder="ธรรม"
                  />
                </LiyonField>
                <LiyonField label="ข้อความในวงกลม 3 (สีน้ำเงิน/คราม)">
                  <input
                    type="text"
                    className="input font-bold"
                    value={bannerValue.circle3Text}
                    onChange={(e) => updateBanner("circle3Text", e.target.value)}
                    placeholder="ปัญญา"
                  />
                </LiyonField>
              </div>
            )}
          </div>
        </div>
      </LiyonCard>
    </div>
  );
}
