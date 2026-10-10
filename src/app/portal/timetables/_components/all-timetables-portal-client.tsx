"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Building2,
  BookOpen,
  Search,
  Download,
  Printer,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Curriculum, Department } from "@/generated/prisma";
import {
  extractTimetableData,
  dateToThaiString,
  resolveSlotPlacement,
  getSlotColorTheme,
  generatePrintableTimetableHtml,
  normalizeAcademicYear,
  type YearTimetable,
  type TimetableSlot,
} from "@/features/curriculum";

interface AllTimetablesPortalClientProps {
  curriculums: (Curriculum & { department?: Department | null })[];
  departments: Department[];
  locale?: string;
}

const DAY_LABELS: Record<string, { th: string; en: string; shortTh: string; color: string }> = {
  Mon: { th: "วันจันทร์", en: "Monday", shortTh: "จันทร์", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  Tue: { th: "วันอังคาร", en: "Tuesday", shortTh: "อังคาร", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30" },
  Wed: { th: "วันพุธ", en: "Wednesday", shortTh: "พุธ", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  Thu: { th: "วันพฤหัสบดี", en: "Thursday", shortTh: "พฤหัสบดี", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  Fri: { th: "วันศุกร์", en: "Friday", shortTh: "ศุกร์", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
};

const ORDERED_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function translateNoteToThai(note: string): string {
  const n = note.trim();
  if (n.includes("The class day is Buddhist Holy Day") || n.includes("Dhammasavana Day")) {
    return "วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)";
  }
  if (n.includes("The Buddhist Holy Days and Sundays are weekly")) {
    return "วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์";
  }
  if (n.includes("Official Days are Holiday") || n.includes("Official Days are Holliday")) {
    return "วันหยุดราชการและวันหยุดนักขัตฤกษ์เป็นวันหยุดทำการ";
  }
  if (n.includes("This schedule will be changed properly") || n.includes("scheldule will be changed")) {
    return "ตารางสอนนี้อาจมีการเปลี่ยนแปลงตามความเหมาะสมของมหาวิทยาลัย";
  }
  return n;
}

function formatYearDisplay(yearStr?: string): string {
  if (!yearStr) return "2569";
  const num = parseInt(yearStr, 10);
  if (!isNaN(num) && num < 2500) {
    return String(num + 543);
  }
  return yearStr;
}

export function AllTimetablesPortalClient({
  curriculums,
  departments,
  locale: _locale = "th",
}: AllTimetablesPortalClientProps) {
  const [selectedCurriculumId, setSelectedCurriculumId] = React.useState<string>(
    curriculums[0]?.id || ""
  );
  const [selectedYearLevel, setSelectedYearLevel] = React.useState<number>(1);

  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState<string>("ALL");
  const [filterDegree, setFilterDegree] = React.useState<string>("ALL");
  const [filterLang, setFilterLang] = React.useState<string>("ALL");
  const [filterYear, setFilterYear] = React.useState<string>("ALL");
  const [filterSemester, setFilterSemester] = React.useState<string>("ALL");

  // Unique academic years across all curriculums
  const allSystemAcademicYears = React.useMemo(() => {
    const set = new Set<string>();
    curriculums.forEach((c) => {
      const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      timetableData?.timetables?.forEach((t) => {
        if (t.academicYear) set.add(normalizeAcademicYear(String(t.academicYear)));
      });
    });
    set.add("2569");
    set.add("2568");
    return Array.from(set).sort().reverse();
  }, [curriculums]);

  const filteredCurriculums = React.useMemo(() => {
    return curriculums.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNameTh = c.nameTh.toLowerCase().includes(q);
        const matchNameEn = (c.nameEn || "").toLowerCase().includes(q);
        const matchMajor = (c.majorTh || "").toLowerCase().includes(q);
        const matchDept = (c.department?.nameTh || "").toLowerCase().includes(q);
        if (!matchNameTh && !matchNameEn && !matchMajor && !matchDept) return false;
      }
      if (filterDept !== "ALL" && c.departmentId !== filterDept) return false;
      if (filterDegree !== "ALL" && c.degree !== filterDegree) return false;
      if (filterLang !== "ALL" && (c.language || "TH") !== filterLang) return false;

      if (filterYear !== "ALL" || filterSemester !== "ALL") {
        const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
        const tList = timetableData?.timetables || [];
        if (tList.length > 0) {
          const matchYear =
            filterYear === "ALL" ||
            tList.some((t) => normalizeAcademicYear(String(t.academicYear)) === normalizeAcademicYear(filterYear));
          const matchSem = filterSemester === "ALL" || tList.some((t) => String(t.semester) === filterSemester);
          if (!matchYear || !matchSem) return false;
        }
      }

      return true;
    });
  }, [curriculums, search, filterDept, filterDegree, filterLang, filterYear, filterSemester]);

  // Derived effective active curriculum
  const activeCurriculum = React.useMemo(() => {
    if (filteredCurriculums.length === 0) return null;
    const match = filteredCurriculums.find((c) => c.id === selectedCurriculumId);
    return match || filteredCurriculums[0];
  }, [filteredCurriculums, selectedCurriculumId]);

  const { timetableData } = React.useMemo(() => {
    if (!activeCurriculum) return { timetableData: null };
    return extractTimetableData(activeCurriculum.descriptionTh, activeCurriculum.descriptionEn);
  }, [activeCurriculum]);

  const timetables = React.useMemo(() => {
    return timetableData?.timetables || [];
  }, [timetableData]);

  // Derived effective active year timetable
  const activeYearTimetable: YearTimetable | undefined = React.useMemo(() => {
    if (timetables.length === 0) return undefined;

    let candidates = timetables.filter((t) => t.yearLevel === selectedYearLevel);
    if (candidates.length === 0) {
      candidates = timetables;
    }

    if (filterYear !== "ALL") {
      const yearMatch = candidates.filter(
        (t) => normalizeAcademicYear(String(t.academicYear)) === normalizeAcademicYear(filterYear)
      );
      if (yearMatch.length > 0) candidates = yearMatch;
    }

    if (filterSemester !== "ALL") {
      const semMatch = candidates.filter((t) => String(t.semester) === filterSemester);
      if (semMatch.length > 0) candidates = semMatch;
    }

    return candidates[0] || timetables[0];
  }, [timetables, selectedYearLevel, filterYear, filterSemester]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handlePrintTimetable = () => {
    if (!activeYearTimetable || !activeCurriculum) return;
    const html = generatePrintableTimetableHtml({
      curriculumName: activeCurriculum.nameTh,
      departmentName: activeCurriculum.department?.nameTh,
      majorName: activeCurriculum.majorTh || undefined,
      timetable: activeYearTimetable,
    });
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
    } else {
      window.print();
    }
  };

  const renderRowPeriods = (dayKey: "Mon" | "Tue" | "Wed" | "Thu" | "Fri", isFirstDay: boolean) => {
    const slots = activeYearTimetable?.slots.filter((s) => s.day === dayKey) || [];
    const placedSlots = slots.map((s) => ({
      slot: s,
      ...resolveSlotPlacement(s),
    }));

    const cells: React.ReactNode[] = [];
    let p = 1;

    while (p <= 7) {
      if (p === 4) {
        if (isFirstDay) {
          cells.push(
            <td
              key="lunch"
              rowSpan={5}
              className="py-6 px-1 border-r text-center align-middle bg-amber-500/10 text-[11px] font-bold text-amber-800 dark:text-amber-300 border-b border-border shadow-2xs"
            >
              <div className="flex flex-col items-center justify-center gap-2 h-full py-2">
                <span className="writing-vertical tracking-[0.3em] font-extrabold text-[12px] text-amber-900 dark:text-amber-200">
                  พักฉันเพล
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-mono writing-vertical">
                  11.30-12.30
                </span>
              </div>
            </td>
          );
        }
      }

      const match = placedSlots.find((ps) => ps.startPeriod === p);
      if (match) {
        cells.push(
          <td
            key={`p-${p}`}
            colSpan={match.span}
            className="p-1.5 border-r align-middle text-center transition-colors"
          >
            <SlotPeriodCard
              slot={match.slot}
              startPeriod={match.startPeriod}
              span={match.span}
            />
          </td>
        );
        p += match.span;
      } else {
        cells.push(
          <td
            key={`empty-${p}`}
            className="p-1.5 border-r text-center align-middle bg-muted/5 text-muted-foreground/30 text-[11px]"
          >
            -
          </td>
        );
        p += 1;
      }
    }

    return cells;
  };

  return (
    <div className="min-h-screen bg-muted/15 pb-20">
      {/* ── TOP BANNER ── */}
      <div className="bg-background border-b shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>บริการสำหรับอาจารย์และนิสิต</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                ตารางการเรียนการสอน (Class Timetables)
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
                ศูนย์รวมตารางเรียนตารางสอนทุกภาควิชา หลักสูตร สาขาวิชา และชั้นปี ค้นหาข้อมูลรายวิชา อาจารย์ผู้สอน และห้องเรียนได้สะดวกรวดเร็ว
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 print:hidden">
              {timetableData?.documentUrl && (
                <a
                  href={timetableData.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>ดาวน์โหลดเอกสาร (PDF)</span>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs h-9 px-3 rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ / บันทึก PDF</span>
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อวิชา หรือสาขาวิชา..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background"
              />
            </div>

            <div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
              >
                <option value="ALL">🏛️ ทุกภาควิชา</option>
                {departments
                  .filter((d) => !d.type || d.type === "DEPARTMENT")
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTh}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <select
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
              >
                <option value="ALL">🎓 ทุกระดับการศึกษา</option>
                <option value="BACHELOR">ปริญญาตรี (Bachelor)</option>
                <option value="MASTER">ปริญญาโท (Master)</option>
                <option value="DOCTORATE">ปริญญาเอก (Doctorate)</option>
                <option value="CERTIFICATE">ประกาศนียบัตร (Certificate)</option>
              </select>
            </div>

            <div>
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
              >
                <option value="ALL">🌐 ทุกภาษาหลักสูตร</option>
                <option value="TH">🇹🇭 หลักสูตรภาษาไทย</option>
                <option value="EN">🇬🇧 English Program</option>
              </select>
            </div>

            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background font-medium text-foreground"
              >
                <option value="ALL">📅 ทุกปีการศึกษา</option>
                {allSystemAcademicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    ปีการศึกษา {formatYearDisplay(yr)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background font-medium text-foreground"
              >
                <option value="ALL">🗓️ ทุกภาคการศึกษา</option>
                <option value="1">ภาคการศึกษาที่ 1</option>
                <option value="2">ภาคการศึกษาที่ 2</option>
                <option value="3">ภาคฤดูร้อน (Summer)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── PROGRAM SELECTOR PILLS ── */}
        <div className="space-y-2 print:hidden">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>เลือกหลักสูตร / สาขาวิชา:</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {filteredCurriculums.map((c) => {
              const isSelected = c.id === selectedCurriculumId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCurriculumId(c.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm scale-100 ring-2 ring-primary/30"
                      : "bg-card border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <p className="truncate max-w-[280px] sm:max-w-md">
                      {c.nameTh}
                    </p>
                    <p className="text-[10px] opacity-80 font-normal">
                      {c.majorTh ? `สาขาวิชา: ${c.majorTh}` : c.department?.nameTh || ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeCurriculum && (
          <div className="space-y-6">
            {/* Active Program Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {activeCurriculum.language === "EN" ? "🇬🇧 English Program" : "🇹🇭 ภาษาไทย"}
                    </span>
                    {activeCurriculum.department && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border/50">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>{activeCurriculum.department.nameTh}</span>
                      </span>
                    )}
                    {activeCurriculum.majorTh && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border/50">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span>สาขาวิชา: {activeCurriculum.majorTh}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                    ตารางสอนระดับปริญญาตรี {activeCurriculum.nameTh}
                  </h2>

                  {activeYearTimetable && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          ภาคการศึกษาที่ {activeYearTimetable.semester} ปีการศึกษา {activeYearTimetable.academicYear || "2569"}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          เปิดเรียนวันที่ {dateToThaiString(activeYearTimetable.startDate) || "9 มิถุนายน 2569"} – สิ้นสุดวันที่ {dateToThaiString(activeYearTimetable.endDate) || "25 กันยายน 2569"}
                        </span>
                      </span>

                      {activeYearTimetable.defaultRoom && (
                        <span className="inline-flex items-center gap-1.5 font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>ห้องเรียนประจำ: {activeYearTimetable.defaultRoom}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 print:hidden">
                  <Link
                    href={`/portal/programs/${activeCurriculum.id}/timetable`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                  >
                    <span>เปิดหน้ารายบุคคลของหลักสูตรนี้</span>
                    <span className="text-sm">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Year Selector Tabs & Quick Year/Semester Filter */}
            {timetables.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 print:hidden">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
                    ระดับชั้นปี:
                  </span>
                  {timetables.map((t, tIdx) => (
                    <button
                      key={`${t.yearLevel}_${t.academicYear || "default"}_${t.semester || 1}_${tIdx}`}
                      type="button"
                      onClick={() => setSelectedYearLevel(t.yearLevel)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        selectedYearLevel === t.yearLevel
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-card border hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>ชั้นปีที่ {t.yearLevel}</span>
                      <span className="text-[10px] opacity-80">({t.slots.length} วิชา)</span>
                    </button>
                  ))}
                </div>

                {/* Quick filter dropdowns for Year & Semester */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground pl-1.5">กรองตาราง:</span>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-border/80 bg-background font-medium text-foreground cursor-pointer"
                    >
                      <option value="ALL">ทุกปีการศึกษา</option>
                      {allSystemAcademicYears.map((yr) => (
                        <option key={yr} value={yr}>
                          ปี {formatYearDisplay(yr)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-border/80 bg-background font-medium text-foreground cursor-pointer"
                    >
                      <option value="ALL">ทุกภาคเรียน</option>
                      <option value="1">ภาคเรียนที่ 1</option>
                      <option value="2">ภาคเรียนที่ 2</option>
                      <option value="3">ภาคฤดูร้อน</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Period / Color Legend */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-card text-xs print:hidden shadow-2xs">
              <span className="font-bold text-foreground flex items-center gap-1.5 mr-1 text-xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>แทบสีแสดงช่วงเวลา:</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <span>เช้า 3 คาบ (09.00 - 11.30)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>เช้า 2 คาบแรก (09.00 - 10.40)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                <span>เช้า 2 คาบหลัง (09.50 - 11.30)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-800 dark:text-indigo-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span>บ่าย 3 คาบ (12.30 - 15.30)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span>บ่าย 2 คาบแรก (12.30 - 14.10)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>บ่าย/เย็น 2 คาบ (14.30 - 16.50)</span>
              </span>
            </div>

            {/* Table Matrix */}
            {activeYearTimetable && (
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
                  {/* Top-Right Action Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-muted/20 border-b">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span>ตารางสอนประจำชั้นปีที่ {activeYearTimetable.yearLevel}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          (ภาคเรียนที่ {activeYearTimetable.semester} / ปีการศึกษา {activeYearTimetable.academicYear || "2569"})
                        </span>
                      </h3>
                      {activeYearTimetable.defaultRoom && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>ห้องเรียนประจำ: {activeYearTimetable.defaultRoom}</span>
                        </p>
                      )}
                    </div>

                    {/* Top-Right Action Buttons: Print */}
                    <div className="flex items-center gap-2 shrink-0 print:hidden">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handlePrintTimetable}
                        className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium cursor-pointer shadow-2xs"
                        title="พิมพ์หรือบันทึกตารางเรียนเป็นเอกสารทางการ (A4 แนวนอน)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>ปริ้นตาราง</span>
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-left border-collapse text-xs min-w-[960px]">
                      <thead>
                        <tr className="bg-muted/70 border-b border-border text-muted-foreground font-bold">
                          <th className="py-2.5 px-2 w-[11%] text-center border-r">เวลา / วัน</th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            09.00 - 09.50
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 1</span>
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            09.50 - 10.40
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 2</span>
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            10.50 - 11.30
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 3</span>
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[4%] bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            11.30-12.30<br/>พักเพล
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            12.30 - 13.20
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 4</span>
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            13.20 - 14.10
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 5</span>
                          </th>
                          <th className="py-2 px-1 text-center border-r w-[12.5%]">
                            14.20 - 15.10
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 6</span>
                          </th>
                          <th className="py-2 px-1 text-center w-[12%]">
                            15.10 - 16.50
                            <span className="block text-[10px] font-normal text-muted-foreground font-mono">คาบที่ 7 (เสริม)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {ORDERED_DAYS.map((dayKey, dayIdx) => {
                          const dayConfig = DAY_LABELS[dayKey];
                          return (
                            <tr key={dayKey} className="hover:bg-muted/10 transition-colors">
                              <td className="py-4 px-2 text-center border-r align-middle bg-muted/20">
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${dayConfig.color}`}>
                                  {dayConfig.th}
                                </span>
                              </td>
                              {renderRowPeriods(dayKey, dayIdx === 0)}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footnotes */}
                {activeYearTimetable.notes && activeYearTimetable.notes.length > 0 && (
                  <div className="rounded-2xl border bg-amber-500/5 border-amber-500/20 p-5 space-y-2.5 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>หมายเหตุประจำภาคการศึกษา:</span>
                    </p>
                    <ol className="space-y-1 pl-5 list-decimal text-foreground/80 text-[11px] leading-relaxed">
                      {activeYearTimetable.notes.map((note, idx) => (
                        <li key={idx} className="font-medium">
                          {translateNoteToThai(note)}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotPeriodCard({
  slot,
  startPeriod,
  span,
}: {
  slot: TimetableSlot;
  startPeriod: number;
  span: number;
}) {
  const theme = getSlotColorTheme(startPeriod, span);

  return (
    <div
      className={`relative rounded-xl border ${theme.border} ${theme.bg} p-2.5 shadow-2xs space-y-1.5 transition-all hover:shadow-xs overflow-hidden h-full min-h-[96px] flex flex-col justify-between items-center text-center`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accentBar}`} />

      <div className="space-y-1 pt-0.5 w-full flex flex-col items-center text-center">
        {/* Top Header: Code & Time Badge (Centered) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap w-full text-center">
          <span className={`font-mono text-xs font-bold ${theme.codeColor}`}>
            {slot.courseCode}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${theme.tagBg} shadow-2xs`}
            title={`คาบเรียน: ${theme.periodLabel} (${slot.timeRange})`}
          >
            {slot.timeRange} {span >= 2 ? `(${span} คาบ)` : ""}
          </span>
        </div>

        {/* Course Name (Centered) */}
        <p className="font-bold text-foreground text-xs leading-snug text-center max-w-[95%] mx-auto">
          {slot.courseName}
          {slot.isMidtermExam && (
            <span
              className="text-red-500 ml-1 font-mono font-bold text-xs"
              title="มีข้อสอบกลาง (*)"
            >
              *
            </span>
          )}
        </p>
      </div>

      <div className="space-y-1 pt-1 border-t border-border/40 text-[11px] w-full flex flex-col items-center text-center">
        {/* Instructors (Centered) */}
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-center max-w-[95%] mx-auto">
          <User className="w-3 h-3 text-primary shrink-0" />
          <span className="line-clamp-2" title={slot.instructors}>
            {slot.instructors}
          </span>
        </div>

        {/* Room (Centered) */}
        {slot.room && (
          <div className="inline-flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-mono">
            <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
            <span>ห้อง {slot.room}</span>
          </div>
        )}
      </div>
    </div>
  );
}
