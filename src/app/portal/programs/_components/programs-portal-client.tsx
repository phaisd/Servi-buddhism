/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Clock, Building2, Search, Filter, Download, Calendar } from "lucide-react";
import type { Curriculum, Department, DegreeLevel } from "@/generated/prisma";

type CurriculumWithDept = Curriculum & { department?: Department | null };

interface ProgramsPortalClientProps {
  items: CurriculumWithDept[];
  departments: Department[];
  locale?: string;
}

const DEGREE_LABELS: Record<DegreeLevel, { th: string; en: string }> = {
  BACHELOR: { th: "ปริญญาตรี", en: "Bachelor's Degree" },
  MASTER: { th: "ปริญญาโท", en: "Master's Degree" },
  DOCTORATE: { th: "ปริญญาเอก", en: "Doctorate" },
  CERTIFICATE: { th: "ประกาศนียบัตร", en: "Certificate" },
};

const LANGUAGE_CONFIG: Record<string, { labelTh: string; labelEn: string; icon: string }> = {
  TH: { labelTh: "ภาษาไทย", labelEn: "Thai Program", icon: "🇹🇭" },
  EN: { labelTh: "ภาษาอังกฤษ", labelEn: "English Program", icon: "🇬🇧" },
};

export function ProgramsPortalClient({
  items,
  departments,
  locale = "th",
}: ProgramsPortalClientProps) {
  const [selectedDept, setSelectedDept] = React.useState<string>("ALL");
  const [selectedDegree, setSelectedDegree] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTh = item.nameTh.toLowerCase().includes(q);
        const matchEn = (item.nameEn || "").toLowerCase().includes(q);
        const matchMajorTh = (item.majorTh || "").toLowerCase().includes(q);
        const matchMajorEn = (item.majorEn || "").toLowerCase().includes(q);
        const matchDept = (item.department?.nameTh || "").toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchMajorTh && !matchMajorEn && !matchDept) return false;
      }
      // Department
      if (selectedDept !== "ALL") {
        if (selectedDept === "NONE" && item.departmentId) return false;
        if (selectedDept !== "NONE" && item.departmentId !== selectedDept) return false;
      }
      // Degree
      if (selectedDegree !== "ALL" && item.degree !== selectedDegree) return false;

      return true;
    });
  }, [items, search, selectedDept, selectedDegree]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{locale === "th" ? "หลักสูตรที่เปิดสอน" : "Academic Programs"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {locale === "th" ? "ข้อมูลหลักสูตรการศึกษา" : "Curriculums & Programs"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {locale === "th"
              ? "รวมหลักสูตรระดับปริญญาตรี ปริญญาโท ปริญญาเอก และประกาศนียบัตร แยกตามภาควิชาและสาขาวิชา"
              : "Explore undergraduate, graduate, and certificate programs across all departments."}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "th" ? "ค้นหาชื่อหลักสูตร..." : "Search programs..."}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* ── DEPARTMENT FILTER TABS ── */}
      {departments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>{locale === "th" ? "เลือกดูตามภาควิชา / ส่วนงาน" : "Filter by Department"}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDept("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedDept === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground"
              }`}
            >
              {locale === "th" ? "🏛️ ทุกภาควิชา" : "All Departments"} ({items.length})
            </button>
            {departments.map((dept) => {
              const count = items.filter((it) => it.departmentId === dept.id).length;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedDept === dept.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span>{locale === "th" ? dept.nameTh : (dept.nameEn || dept.nameTh)}</span>
                  <span className="ml-1.5 text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DEGREE LEVEL FILTER PILLS ── */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
        <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>{locale === "th" ? "ระดับ:" : "Degree:"}</span>
        </span>
        {(["ALL", "BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"] as const).map((deg) => (
          <button
            key={deg}
            type="button"
            onClick={() => setSelectedDegree(deg)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedDegree === deg
                ? "bg-foreground text-background font-semibold"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            }`}
          >
            {deg === "ALL"
              ? locale === "th"
                ? "ทุกระดับ"
                : "All Levels"
              : locale === "th"
              ? DEGREE_LABELS[deg]?.th
              : DEGREE_LABELS[deg]?.en}
          </button>
        ))}
      </div>

      {/* ── PROGRAM CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-0.5"
          >
            {item.imageUrl && (
              <div className="h-44 w-full overflow-hidden bg-muted relative">
                <img
                  src={item.imageUrl}
                  alt={item.nameTh}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold tracking-wide uppercase">
                    <GraduationCap className="h-3 w-3" />
                    <span>
                      {locale === "th"
                        ? DEGREE_LABELS[item.degree]?.th
                        : DEGREE_LABELS[item.degree]?.en}
                    </span>
                  </span>

                  {item.language && LANGUAGE_CONFIG[item.language] && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-medium border border-border/50">
                      <span>{LANGUAGE_CONFIG[item.language].icon}</span>
                      <span>
                        {locale === "th"
                          ? LANGUAGE_CONFIG[item.language].labelTh
                          : LANGUAGE_CONFIG[item.language].labelEn}
                      </span>
                    </span>
                  )}

                  {item.department && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium">
                      <Building2 className="h-3 w-3 text-primary" />
                      <span>
                        {locale === "th"
                          ? item.department.nameTh
                          : (item.department.nameEn || item.department.nameTh)}
                      </span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {locale === "th" ? item.nameTh : (item.nameEn || item.nameTh)}
                </h3>

                {(item.majorTh || item.majorEn) && (
                  <p className="text-xs font-semibold text-primary/90 mb-1.5 flex items-center gap-1">
                    <span>สาขาวิชา:</span>
                    <span>{locale === "th" ? (item.majorTh || item.majorEn) : (item.majorEn || item.majorTh)}</span>
                  </p>
                )}

                {item.nameEn && locale === "th" && (
                  <p className="text-xs text-muted-foreground font-sans mb-3">
                    {item.nameEn}
                  </p>
                )}

                {(() => {
                  const docRegex = /<!-- TIMETABLE_DOC:(.*?) -->/;
                  const rawDesc = locale === "th"
                    ? item.descriptionTh || "หลักสูตรคุณภาพมาตรฐานสากล ผลิตบัณฑิตที่มีคุณธรรมและปัญญา"
                    : (item.descriptionEn || item.descriptionTh || "Quality academic curriculum producing ethical and visionary scholars.");
                  
                  const cleanDesc = rawDesc.replace(docRegex, "").trim();

                  const matchTh = (item.descriptionTh || "").match(docRegex);
                  const matchEn = (item.descriptionEn || "").match(docRegex);
                  const match = matchTh || matchEn;

                  let docUrl = "";
                  let _docName = "";
                  if (match) {
                    try {
                      const parsed = JSON.parse(match[1]);
                      docUrl = parsed.url;
                      _docName = parsed.name || (locale === "th" ? "ตารางเรียน / แผนการศึกษา" : "Class Timetable & Syllabus");
                    } catch {
                      docUrl = match[1];
                      _docName = locale === "th" ? "ตารางเรียน / แผนการศึกษา" : "Class Timetable & Syllabus";
                    }
                  }

                  return (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {cleanDesc || (locale === "th" ? "หลักสูตรคุณภาพมาตรฐานสากล" : "Quality academic curriculum")}
                      </p>

                      <div className="pt-1 flex flex-col gap-2">
                        <Link
                          href={`/portal/programs/${item.id}/timetable`}
                          className="inline-flex items-center gap-2 w-full justify-center px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {locale === "th" ? "ดูตารางการเรียนการสอน (Interactive)" : "View Class Timetable"}
                          </span>
                        </Link>

                        {docUrl && (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 w-full justify-center px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium transition-all border border-border/60"
                          >
                            <Download className="w-3 h-3 shrink-0 text-primary" />
                            <span className="truncate">
                              {locale === "th" ? "ดาวน์โหลดไฟล์ตารางเรียน (PDF)" : "Download PDF Timetable"}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {item.durationYears} {locale === "th" ? "ปีการศึกษา" : "Years"}
                  </span>
                </div>
                {item.department?.code && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted">
                    {item.department.code}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground rounded-2xl border border-dashed p-8">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-base font-semibold">
              {locale === "th" ? "ไม่พบข้อมูลหลักสูตรที่ตรงกับเงื่อนไข" : "No programs found matching the filters."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {locale === "th"
                ? "ลองเปลี่ยนตัวกรองภาควิชา หรือระดับการศึกษาอื่น"
                : "Try selecting a different department or degree level."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
