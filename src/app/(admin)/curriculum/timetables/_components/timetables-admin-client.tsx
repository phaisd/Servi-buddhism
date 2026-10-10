"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  GraduationCap,
  ExternalLink,
  FileText,
  Save,
  RotateCcw,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Copy,
} from "lucide-react";
import {
  LiyonCard,
  LiyonField,
  LiyonSelect,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCurriculumAction } from "@/features/curriculum/actions";
import {
  extractTimetableData,
  injectTimetableData,
  dateToThaiString,
  toDateInputValue,
  generateTimetableCsv,
  generateBatchTimetablesCsv,
  generateCsvTemplate,
  parseTimetableCsv,
  generatePrintableTimetableHtml,
  normalizeAcademicYear,
  type YearTimetable,
  type TimetableSlot,
  type ParsedCsvSlotItem,
  SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE,
  SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE,
} from "@/features/curriculum";
import type { Curriculum, Department, DegreeLevel } from "@/generated/prisma";

type CurriculumWithDept = Curriculum & { department?: Department | null };

interface TimetablesAdminClientProps {
  curriculums: CurriculumWithDept[];
  departments: Department[];
}

const DEGREE_LABELS: Record<DegreeLevel, { th: string; en: string }> = {
  BACHELOR: { th: "ปริญญาตรี", en: "Bachelor's" },
  MASTER: { th: "ปริญญาโท", en: "Master's" },
  DOCTORATE: { th: "ปริญญาเอก", en: "Doctorate" },
  CERTIFICATE: { th: "ประกาศนียบัตร", en: "Certificate" },
};

const DAY_OPTIONS = [
  { value: "Mon", th: "วันจันทร์", en: "Monday" },
  { value: "Tue", th: "วันอังคาร", en: "Tuesday" },
  { value: "Wed", th: "วันพุธ", en: "Wednesday" },
  { value: "Thu", th: "วันพฤหัสบดี", en: "Thursday" },
  { value: "Fri", th: "วันศุกร์", en: "Friday" },
  { value: "Sat", th: "วันเสาร์", en: "Saturday" },
  { value: "Sun", th: "วันอาทิตย์", en: "Sunday" },
];

export function TimetablesAdminClient({
  curriculums: initialCurriculums,
  departments,
}: TimetablesAdminClientProps) {
  const [items, setItems] = React.useState<CurriculumWithDept[]>(initialCurriculums);

  // Filters
  const [search, setSearch] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("ALL");
  const [filterSemester, setFilterSemester] = React.useState("ALL");
  const [filterDegree, setFilterDegree] = React.useState("ALL");
  const [filterDept, setFilterDept] = React.useState("ALL");
  const [filterLang, setFilterLang] = React.useState("ALL");
  const [filterMajor, setFilterMajor] = React.useState("ALL");
  const [filterClassYear, setFilterClassYear] = React.useState("ALL");

  // Selected curriculum and edit state
  const [editingCurriculum, setEditingCurriculum] = React.useState<CurriculumWithDept | null>(null);
  const [timetables, setTimetables] = React.useState<YearTimetable[]>([]);
  const [activeYearLevel, setActiveYearLevel] = React.useState<number>(1);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Batch Import Modal State
  const [isBatchImportOpen, setIsBatchImportOpen] = React.useState(false);
  const [batchImportData, setBatchImportData] = React.useState<{
    fileName: string;
    items: ParsedCsvSlotItem[];
  } | null>(null);
  const [batchTargetCurriculumId, setBatchTargetCurriculumId] = React.useState<string>("AUTO");
  const [batchImportMode, setBatchImportMode] = React.useState<"append" | "replace">("append");
  const [batchSaving, setBatchSaving] = React.useState(false);
  const batchFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Slot editor dialog state
  const [editingSlotIndex, setEditingSlotIndex] = React.useState<number | null>(null);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = React.useState(false);
  const [slotForm, setSlotForm] = React.useState<TimetableSlot>({
    day: "Mon",
    timeRange: "09.00-11.30",
    courseCode: "",
    courseName: "",
    instructors: "",
    room: "",
    isMidtermExam: false,
    startPeriod: undefined,
    periodSpan: undefined,
  });

  // Extract all distinct majors from items
  const majorList = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => {
      if (c.majorTh) set.add(c.majorTh);
    });
    return Array.from(set);
  }, [items]);

  // Open curriculum timetable editor
  const handleEditTimetable = (c: CurriculumWithDept) => {
    setEditingCurriculum(c);
    const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
    const initialList = timetableData?.timetables || [];
    setTimetables(initialList);
    setActiveYearLevel(initialList[0]?.yearLevel || 1);
    setIsEditorOpen(true);
  };

  // Active Year Timetable
  const currentYearTimetable = React.useMemo(() => {
    return timetables.find((t) => t.yearLevel === activeYearLevel);
  }, [timetables, activeYearLevel]);

  // Add / Create Year
  const handleAddYear = () => {
    const existingLevels = timetables.map((t) => t.yearLevel);
    let nextLevel = 1;
    while (existingLevels.includes(nextLevel) && nextLevel <= 8) {
      nextLevel++;
    }
    const newYear: YearTimetable = {
      yearLevel: nextLevel,
      semester: 1,
      academicYear: "2569",
      startDate: "9 มิถุนายน 2569",
      endDate: "25 กันยายน 2569",
      defaultRoom: `ชั้น 5 ห้อง D 516/${nextLevel}`,
      notes: [
        "วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)",
        "เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง",
      ],
      slots: [],
    };
    setTimetables([...timetables, newYear]);
    setActiveYearLevel(nextLevel);
  };

  // Delete Year
  const handleDeleteYear = (yearLvl: number) => {
    if (!confirm(`คุณต้องการลบตารางเรียนของ ชั้นปีที่ ${yearLvl} ใช่หรือไม่?`)) return;
    const remaining = timetables.filter((t) => t.yearLevel !== yearLvl);
    setTimetables(remaining);
    if (remaining.length > 0) {
      setActiveYearLevel(remaining[0].yearLevel);
    }
  };

  // Open slot editor
  const handleOpenAddSlot = () => {
    setEditingSlotIndex(null);
    setSlotForm({
      day: "Mon",
      timeRange: "09.00-11.30",
      courseCode: "",
      courseName: "",
      instructors: "",
      room: currentYearTimetable?.defaultRoom || "",
      isMidtermExam: false,
      startPeriod: undefined,
      periodSpan: undefined,
    });
    setIsSlotDialogOpen(true);
  };

  const handleOpenEditSlot = (index: number) => {
    if (!currentYearTimetable) return;
    setEditingSlotIndex(index);
    setSlotForm({ ...currentYearTimetable.slots[index] });
    setIsSlotDialogOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.courseCode.trim() || !slotForm.courseName.trim()) {
      toast.error("กรุณาระบุรหัสวิชาและชื่อวิชา");
      return;
    }
    if (!currentYearTimetable) return;

    const updatedSlots = [...currentYearTimetable.slots];
    if (editingSlotIndex !== null) {
      updatedSlots[editingSlotIndex] = { ...slotForm };
    } else {
      updatedSlots.push({ ...slotForm });
    }

    setTimetables((prev) =>
      prev.map((t) => (t.yearLevel === activeYearLevel ? { ...t, slots: updatedSlots } : t))
    );
    setIsSlotDialogOpen(false);
  };

  const handleDeleteSlot = (index: number) => {
    if (!currentYearTimetable) return;
    const slot = currentYearTimetable.slots[index];
    const name = slot.courseName ? `"${slot.courseName}" (${slot.courseCode})` : "คาบเรียนนี้";
    if (!confirm(`คุณต้องการลบ ${name} ออกจากตารางเรียนใช่หรือไม่?`)) return;

    const updatedSlots = currentYearTimetable.slots.filter((_, i) => i !== index);
    setTimetables((prev) =>
      prev.map((t) => (t.yearLevel === activeYearLevel ? { ...t, slots: updatedSlots } : t))
    );
    toast.success("ลบคาบเรียนเรียบร้อยแล้ว");
  };

  const handleDuplicateSlot = (index: number) => {
    if (!currentYearTimetable) return;
    const slotToCopy = currentYearTimetable.slots[index];
    const newSlot: TimetableSlot = { ...slotToCopy };
    const updatedSlots = [...currentYearTimetable.slots];
    // เพิ่มถัดจากรายการปัจจุบัน
    updatedSlots.splice(index + 1, 0, newSlot);
    setTimetables((prev) =>
      prev.map((t) => (t.yearLevel === activeYearLevel ? { ...t, slots: updatedSlots } : t))
    );
    toast.success(`เพิ่มคาบเรียนใหม่เรียบร้อยแล้ว (${newSlot.courseName || newSlot.courseCode})`);
  };

  // ── CSV Export / Download Template ──
  const handleExportCsv = () => {
    if (!currentYearTimetable) {
      toast.error("ไม่มีข้อมูลตารางเรียนในชั้นปีนี้");
      return;
    }
    const csvContent = generateTimetableCsv(currentYearTimetable.slots, {
      yearLevel: currentYearTimetable.yearLevel,
      curriculumName: editingCurriculum?.nameTh,
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ตารางเรียน_${editingCurriculum?.nameTh || "หลักสูตร"}_ชั้นปี_${activeYearLevel}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`ส่งออกไฟล์ CSV ชั้นปีที่ ${activeYearLevel} เรียบร้อยแล้ว`);
  };

  const handleDownloadTemplateCsv = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "เทมเพลต_ตารางเรียน_MCU.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลดเทมเพลต CSV เรียบร้อยแล้ว");
  };

  // ── CSV Import ──
  const handleTriggerCsvUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";
        const parsedItems = parseTimetableCsv(text);
        if (parsedItems.length === 0) {
          toast.error("ไม่พบข้อมูลคาบเรียนที่ถูกต้องในไฟล์ CSV");
          return;
        }

        // Group slots by yearLevel + academicYear + semester
        const groups = new Map<
          string,
          {
            yearLevel: number;
            academicYear: string;
            semester: number;
            slots: TimetableSlot[];
          }
        >();

        parsedItems.forEach((item) => {
          const y = item.yearLevel || activeYearLevel;
          const ay = normalizeAcademicYear(item.academicYear || "2569");
          const sem = item.semester || 1;
          const key = `${y}_${ay}_${sem}`;

          if (!groups.has(key)) {
            groups.set(key, {
              yearLevel: y,
              academicYear: ay,
              semester: sem,
              slots: [],
            });
          }
          groups.get(key)!.slots.push(item.slot);
        });

        setTimetables((prev) => {
          const updated = [...prev];
          groups.forEach(({ yearLevel, academicYear, semester, slots }) => {
            const idx = updated.findIndex(
              (t) =>
                t.yearLevel === yearLevel &&
                normalizeAcademicYear(t.academicYear) === academicYear &&
                (t.semester || 1) === semester
            );

            if (idx !== -1) {
              // Add slots into existing year level
              updated[idx] = {
                ...updated[idx],
                academicYear,
                semester,
                slots: [...updated[idx].slots, ...slots],
              };
            } else {
              // Create new year level
              updated.push({
                yearLevel,
                semester,
                academicYear,
                startDate: "9 มิถุนายน " + academicYear,
                endDate: "25 กันยายน " + academicYear,
                defaultRoom: `ชั้น 5 ห้อง D 516/${yearLevel}`,
                slots,
              });
            }
          });
          return updated;
        });

        toast.success(`นำเข้าข้อมูลตารางเรียนสำเร็จ ${parsedItems.length} คาบเรียน`);
      } catch {
        toast.error("เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // ── PDF Export / Print ──
  const handleExportPdf = () => {
    if (!currentYearTimetable || !editingCurriculum) {
      toast.error("ไม่มีข้อมูลตารางเรียนสำหรับพิมพ์หรือส่งออก PDF");
      return;
    }
    const html = generatePrintableTimetableHtml({
      curriculumName: editingCurriculum.nameTh,
      departmentName: editingCurriculum.department?.nameTh,
      majorName: editingCurriculum.majorTh || undefined,
      timetable: currentYearTimetable,
    });

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
    } else {
      toast.error("กรุณาอนุญาตให้เปิดหน้าต่าง Pop-up เพื่อพิมพ์หรือบันทึก PDF");
    }
  };

  // ── Batch Export All Curriculums ──
  const handleExportAllBatchCsv = () => {
    const exportList = items.map((c) => {
      const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      return {
        curriculumName: c.nameTh,
        majorName: c.majorTh || undefined,
        timetables: timetableData?.timetables || [],
      };
    });

    const totalSlots = exportList.reduce(
      (sum, item) => sum + item.timetables.reduce((s, yt) => s + yt.slots.length, 0),
      0
    );

    if (totalSlots === 0) {
      toast.error("ยังไม่มีข้อมูลตารางเรียนในระบบให้ส่งออก");
      return;
    }

    const csvContent = generateBatchTimetablesCsv(exportList);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ตารางเรียน_MCU_ทุกหลักสูตร_${new Date().getFullYear() + 543}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`ส่งออกข้อมูลตารางเรียนทั้งหมดสำเร็จ (${totalSlots} คาบเรียน)`);
  };

  // ── Export Specific Curriculum CSV ──
  const handleExportCurriculumCsv = (c: CurriculumWithDept) => {
    const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
    const timetables = timetableData?.timetables || [];
    if (timetables.length === 0 || !timetables.some((t) => t.slots.length > 0)) {
      toast.error(`หลักสูตร "${c.nameTh}" ยังไม่มีข้อมูลคาบเรียน`);
      return;
    }

    const csvContent = generateBatchTimetablesCsv([
      {
        curriculumName: c.nameTh,
        majorName: c.majorTh || undefined,
        timetables,
      },
    ]);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ตารางเรียน_${c.nameTh}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`ส่งออกไฟล์ CSV ของหลักสูตร "${c.nameTh}" เรียบร้อยแล้ว`);
  };

  // ── Print Specific Curriculum PDF ──
  const handlePrintCurriculumPdf = (c: CurriculumWithDept) => {
    const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
    const timetables = timetableData?.timetables || [];
    if (timetables.length === 0) {
      toast.error(`หลักสูตร "${c.nameTh}" ยังไม่มีข้อมูลตารางเรียน`);
      return;
    }

    const htmls = timetables.map((yt) =>
      generatePrintableTimetableHtml({
        curriculumName: c.nameTh,
        departmentName: c.department?.nameTh,
        majorName: c.majorTh || undefined,
        timetable: yt,
      })
    );

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      // Render first timetable html
      printWin.document.write(htmls[0]);
      printWin.document.close();
      printWin.focus();
    } else {
      toast.error("กรุณาอนุญาตหน้าต่าง Pop-up เพื่อเปิดเอกสารพิมพ์");
    }
  };

  // ── Print All Curriculums PDF ──
  const handlePrintAllPdf = () => {
    const itemsWithTimetables = items.filter((c) => {
      const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      return (timetableData?.timetables || []).length > 0;
    });

    if (itemsWithTimetables.length === 0) {
      toast.error("ยังไม่มีหลักสูตรที่มีตารางเรียนบันทึกไว้");
      return;
    }

    // Print first active one with prompt
    const first = itemsWithTimetables[0];
    handlePrintCurriculumPdf(first);
  };

  // ── Delete All Timetable of a Curriculum ──
  const handleDeleteCurriculumTimetable = async (c: CurriculumWithDept) => {
    if (!confirm(`คุณต้องการลบข้อมูลตารางเรียนทั้งหมดของหลักสูตร "${c.nameTh}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const { cleanDescTh } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      const updated = await updateCurriculumAction(c.id, { descriptionTh: cleanDescTh });
      setItems((prev) => prev.map((it) => (it.id === c.id ? { ...it, ...updated } : it)));
      toast.success(`ลบข้อมูลตารางเรียนของหลักสูตร "${c.nameTh}" เรียบร้อยแล้ว`);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบตารางเรียน");
    }
  };

  // ── Batch Import Trigger & Execution ──
  const handleTriggerBatchImport = (targetCurriculumId = "AUTO") => {
    setBatchTargetCurriculumId(targetCurriculumId);
    batchFileInputRef.current?.click();
  };

  const handleBatchFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";
        const parsedItems = parseTimetableCsv(text);
        if (parsedItems.length === 0) {
          toast.error("ไม่พบข้อมูลคาบเรียนที่ถูกต้องในไฟล์ CSV");
          return;
        }

        setBatchImportData({
          fileName: file.name,
          items: parsedItems,
        });
        setIsBatchImportOpen(true);
      } catch {
        toast.error("เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV");
      } finally {
        if (batchFileInputRef.current) batchFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleConfirmBatchImport = async () => {
    if (!batchImportData || batchImportData.items.length === 0) return;
    setBatchSaving(true);
    try {
      const itemsToProcess = batchImportData.items;

      // Group by curriculumId -> Array of items
      const targetMap = new Map<string, ParsedCsvSlotItem[]>();

      for (const item of itemsToProcess) {
        let targetCurriculum: CurriculumWithDept | undefined;

        if (batchTargetCurriculumId !== "AUTO") {
          targetCurriculum = items.find((c) => c.id === batchTargetCurriculumId);
        } else if (item.curriculumName) {
          const qName = item.curriculumName.toLowerCase().trim();
          const qMajor = (item.majorName || "").toLowerCase().trim();

          // Try match both name and major first
          if (qMajor) {
            targetCurriculum = items.find(
              (c) =>
                (c.nameTh.toLowerCase().includes(qName) || qName.includes(c.nameTh.toLowerCase())) &&
                (c.majorTh?.toLowerCase().includes(qMajor) || qMajor.includes(c.majorTh?.toLowerCase() || ""))
            );
          }

          // Fallback to name or English name
          if (!targetCurriculum) {
            targetCurriculum = items.find(
              (c) =>
                c.nameTh.toLowerCase().includes(qName) ||
                qName.includes(c.nameTh.toLowerCase()) ||
                (c.nameEn && c.nameEn.toLowerCase().includes(qName))
            );
          }
        }

        // Fallback to first curriculum if unmatched
        if (!targetCurriculum) {
          targetCurriculum = items[0];
        }

        if (!targetCurriculum) continue;

        const cId = targetCurriculum.id;
        const list = targetMap.get(cId) || [];
        list.push(item);
        targetMap.set(cId, list);
      }

      const updatedCurriculums: CurriculumWithDept[] = [];

      for (const [cId, currItems] of targetMap.entries()) {
        const c = items.find((it) => it.id === cId);
        if (!c) continue;

        const { cleanDescTh, timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
        const existingTimetables = [...(timetableData?.timetables || [])];

        // Group currItems by [yearLevel, academicYear, semester]
        const groupMap = new Map<
          string,
          {
            yearLevel: number;
            academicYear: string;
            semester: number;
            slots: TimetableSlot[];
          }
        >();

        for (const it of currItems) {
          const yLvl = it.yearLevel || 1;
          const ay = normalizeAcademicYear(it.academicYear || "2569");
          const sem = it.semester || 1;
          const key = `${yLvl}_${ay}_${sem}`;

          if (!groupMap.has(key)) {
            groupMap.set(key, {
              yearLevel: yLvl,
              academicYear: ay,
              semester: sem,
              slots: [],
            });
          }
          groupMap.get(key)!.slots.push(it.slot);
        }

        groupMap.forEach(({ yearLevel, academicYear, semester, slots }) => {
          // Find matching existing timetable by yearLevel AND academicYear AND semester
          let idx = existingTimetables.findIndex(
            (t) =>
              t.yearLevel === yearLevel &&
              normalizeAcademicYear(t.academicYear) === academicYear &&
              (t.semester || 1) === semester
          );

          // If not found, try matching by yearLevel only if existing timetable has no slots or replace mode
          if (idx === -1 && batchImportMode === "replace") {
            const yIdx = existingTimetables.findIndex((t) => t.yearLevel === yearLevel);
            if (yIdx !== -1) {
              idx = yIdx;
            }
          }

          if (idx !== -1) {
            if (batchImportMode === "replace") {
              existingTimetables[idx] = {
                ...existingTimetables[idx],
                academicYear,
                semester,
                slots,
              };
            } else {
              existingTimetables[idx] = {
                ...existingTimetables[idx],
                academicYear,
                semester,
                slots: [...existingTimetables[idx].slots, ...slots],
              };
            }
          } else {
            existingTimetables.push({
              yearLevel,
              semester,
              academicYear,
              startDate: "9 มิถุนายน " + academicYear,
              endDate: "25 กันยายน " + academicYear,
              defaultRoom: `ชั้น 5 ห้อง D 516/${yearLevel}`,
              slots,
            });
          }
        });

        const finalDescTh = injectTimetableData(cleanDescTh, {
          documentUrl: timetableData?.documentUrl,
          documentName: timetableData?.documentName,
          timetables: existingTimetables,
        });

        const updated = await updateCurriculumAction(cId, { descriptionTh: finalDescTh });
        updatedCurriculums.push({ ...c, ...updated });
      }

      setItems((prev) =>
        prev.map((c) => {
          const match = updatedCurriculums.find((u) => u.id === c.id);
          return match || c;
        })
      );

      toast.success(`นำเข้าข้อมูลตารางเรียนสำเร็จ ${itemsToProcess.length} คาบเรียน`);
      setIsBatchImportOpen(false);
      setBatchImportData(null);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูลตารางเรียน");
    } finally {
      setBatchSaving(false);
    }
  };
  // Save full curriculum timetables to database
  const handleSaveAllTimetables = async () => {
    if (!editingCurriculum) return;
    setSaving(true);
    try {
      const { cleanDescTh, cleanDescEn: _cleanDescEn, timetableData } = extractTimetableData(
        editingCurriculum.descriptionTh,
        editingCurriculum.descriptionEn
      );

      const finalDescTh = injectTimetableData(cleanDescTh, {
        documentUrl: timetableData?.documentUrl,
        documentName: timetableData?.documentName,
        timetables,
      });

      const updated = await updateCurriculumAction(editingCurriculum.id, {
        descriptionTh: finalDescTh,
      });

      setItems((prev) =>
        prev.map((it) => (it.id === editingCurriculum.id ? { ...it, ...updated } : it))
      );

      toast.success("บันทึกข้อมูลตารางการเรียนการสอนเรียบร้อยแล้ว");
      setIsEditorOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลตารางเรียน");
    } finally {
      setSaving(false);
    }
  };

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((c) => {
      const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      const currTimetables = timetableData?.timetables || [];

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNameTh = c.nameTh.toLowerCase().includes(q);
        const matchNameEn = (c.nameEn || "").toLowerCase().includes(q);
        const matchMajor = (c.majorTh || "").toLowerCase().includes(q);
        const matchDept = (c.department?.nameTh || "").toLowerCase().includes(q);
        if (!matchNameTh && !matchNameEn && !matchMajor && !matchDept) return false;
      }

      // Degree
      if (filterDegree !== "ALL" && c.degree !== filterDegree) return false;

      // Department
      if (filterDept !== "ALL" && c.departmentId !== filterDept) return false;

      // Language
      if (filterLang !== "ALL" && (c.language || "TH") !== filterLang) return false;

      // Major
      if (filterMajor !== "ALL" && c.majorTh !== filterMajor) return false;

      // Year filter (from slots)
      if (filterYear !== "ALL") {
        const hasYear = currTimetables.some(
          (t) => normalizeAcademicYear(t.academicYear) === normalizeAcademicYear(filterYear)
        );
        if (!hasYear) return false;
      }

      // Semester filter
      if (filterSemester !== "ALL") {
        const hasSem = currTimetables.some((t) => String(t.semester) === filterSemester);
        if (!hasSem) return false;
      }

      // Class Year
      if (filterClassYear !== "ALL") {
        const hasClassYear = currTimetables.some((t) => String(t.yearLevel) === filterClassYear);
        if (!hasClassYear) return false;
      }

      return true;
    });
  }, [items, search, filterDegree, filterDept, filterLang, filterMajor, filterYear, filterSemester, filterClassYear]);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>ระบบหลักสูตรและการศึกษา</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ตารางการเรียนการสอน (Class Timetables)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            จัดการตารางเรียนแยกตาม ปีการศึกษา, ภาคการศึกษา, ระดับการศึกษา, ภาควิชา, หลักสูตรภาษา, สาขาวิชา และชั้นปี
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for Batch Import */}
          <input
            type="file"
            ref={batchFileInputRef}
            accept=".csv,text/csv"
            onChange={handleBatchFileSelected}
            className="hidden"
          />

          {/* ปุ่มนำเข้าชุดข้อมูล CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTriggerBatchImport("AUTO")}
            className="h-8.5 text-xs gap-1.5 border-dashed hover:bg-muted cursor-pointer"
            title="นำเข้าข้อมูลตารางเรียนเป็นชุดจากไฟล์ CSV (อัปโหลดหลายหลักสูตรพร้อมกันได้)"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>นำเข้าตารางเรียน (CSV)</span>
          </Button>

          {/* ปุ่มดาวน์โหลดเทมเพลต CSV */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownloadTemplateCsv}
            className="h-8.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title="ดาวน์โหลดไฟล์เทมเพลต CSV เปล่าสำหรับนำไปกรอกข้อมูลตารางเรียน"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>เทมเพลต CSV</span>
          </Button>

          {/* ปุ่มส่งออกข้อมูลทั้งหมดเป็น CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportAllBatchCsv}
            className="h-8.5 text-xs gap-1.5 hover:bg-muted cursor-pointer"
            title="ส่งออกตารางเรียนทุกหลักสูตรออกมาเป็นไฟล์ CSV รวม"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกทั้งหมด (CSV)</span>
          </Button>

          {/* ปุ่มส่งออก/พิมพ์ PDF รวม */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrintAllPdf}
            className="h-8.5 text-xs gap-1.5 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
            title="พิมพ์หรือส่งออกตารางเรียนทางการทั้งหมดเป็น PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ / PDF รวม</span>
          </Button>

          <Link
            href="/portal/timetables"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors h-8.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>Portal ตารางเรียน</span>
          </Link>
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors h-8.5"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>จัดการหลักสูตร</span>
          </Link>
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <LiyonCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" />
            <span>ตัวกรองการค้นหาตารางเรียนแบบละเอียด</span>
          </span>
          {(filterYear !== "ALL" ||
            filterSemester !== "ALL" ||
            filterDegree !== "ALL" ||
            filterDept !== "ALL" ||
            filterLang !== "ALL" ||
            filterMajor !== "ALL" ||
            filterClassYear !== "ALL" ||
            search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterYear("ALL");
                setFilterSemester("ALL");
                setFilterDegree("ALL");
                setFilterDept("ALL");
                setFilterLang("ALL");
                setFilterMajor("ALL");
                setFilterClassYear("ALL");
              }}
              className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* 1. ค้นหา */}
          <div className="lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหลักสูตร, สาขาวิชา..."
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
            />
          </div>

          {/* 2. ปีการศึกษา */}
          <div>
            <LiyonSelect
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ปีการศึกษาทั้งหมด</option>
              <option value="2569">2569 (2026)</option>
              <option value="2568">2568 (2025)</option>
              <option value="2567">2567 (2024)</option>
            </LiyonSelect>
          </div>

          {/* 3. ภาคการศึกษา */}
          <div>
            <LiyonSelect
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ภาคเรียนทั้งหมด</option>
              <option value="1">ภาคการศึกษาที่ 1</option>
              <option value="2">ภาคการศึกษาที่ 2</option>
              <option value="3">ภาคฤดูร้อน</option>
            </LiyonSelect>
          </div>

          {/* 4. ระดับการศึกษา */}
          <div>
            <LiyonSelect
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ระดับการศึกษาทั้งหมด</option>
              <option value="BACHELOR">ปริญญาตรี</option>
              <option value="MASTER">ปริญญาโท</option>
              <option value="DOCTORATE">ปริญญาเอก</option>
              <option value="CERTIFICATE">ประกาศนียบัตร</option>
            </LiyonSelect>
          </div>

          {/* 5. ภาควิชา */}
          <div>
            <LiyonSelect
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ภาควิชาทั้งหมด</option>
              {departments
                .filter((d) => !d.type || d.type === "DEPARTMENT")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameTh}
                  </option>
                ))}
            </LiyonSelect>
          </div>

          {/* 6. ภาษาหลักสูตร */}
          <div>
            <LiyonSelect
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ภาษาทั้งหมด</option>
              <option value="TH">ไทย (TH)</option>
              <option value="EN">อังกฤษ (EN)</option>
            </LiyonSelect>
          </div>

          {/* 7. ชั้นปี */}
          <div>
            <LiyonSelect
              value={filterClassYear}
              onChange={(e) => setFilterClassYear(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">ชั้นปีทั้งหมด</option>
              <option value="1">ชั้นปีที่ 1</option>
              <option value="2">ชั้นปีที่ 2</option>
              <option value="3">ชั้นปีที่ 3</option>
              <option value="4">ชั้นปีที่ 4</option>
            </LiyonSelect>
          </div>
        </div>

        {/* 8. สาขาวิชาแถวเสริม */}
        {majorList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px]">สาขาวิชา:</span>
            <button
              type="button"
              onClick={() => setFilterMajor("ALL")}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                filterMajor === "ALL"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              ทั้งหมด
            </button>
            {majorList.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFilterMajor(m)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                  filterMajor === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </LiyonCard>

      {/* ── TIMETABLES LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const { timetableData } = extractTimetableData(item.descriptionTh, item.descriptionEn);
          const currTimetables = timetableData?.timetables || [];

          return (
            <LiyonCard key={item.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        {DEGREE_LABELS[item.degree]?.th || item.degree}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground border">
                        {item.language === "EN" ? "🇬🇧 English Program" : "🇹🇭 ภาษาไทย"}
                      </span>
                      {item.department && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                          {item.department.nameTh}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-foreground mt-1">
                      {item.nameTh}
                    </h3>
                    {item.nameEn && (
                      <p className="text-xs text-muted-foreground font-sans">{item.nameEn}</p>
                    )}
                    {item.majorTh && (
                      <p className="text-xs font-semibold text-primary flex items-center gap-1 pt-0.5">
                        <BookOpen className="w-3 h-3" />
                        <span>สาขาวิชา: {item.majorTh}</span>
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/portal/programs/${item.id}/timetable`}
                    target="_blank"
                    className="p-2 rounded-lg border hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title="เปิดหน้าเพจ Portal ดูตารางเรียน"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {/* Years & Slots Summary */}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <p className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                    <span>ตารางเรียนประจำชั้นปีที่บันทึกไว้ ({currTimetables.length} ชั้นปี)</span>
                    {timetableData?.documentUrl && (
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-normal flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>มีเอกสารแนบ</span>
                      </span>
                    )}
                  </p>

                  {currTimetables.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {currTimetables.map((yt, ytIdx) => (
                        <div
                          key={`${yt.yearLevel}_${yt.academicYear || "default"}_${yt.semester || 1}_${ytIdx}`}
                          className="p-2 rounded-xl border bg-muted/20 text-center space-y-0.5"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-bold text-foreground">
                              ชั้นปีที่ {yt.yearLevel}
                            </span>
                            {yt.academicYear && (
                              <span className="text-[10px] font-medium text-primary">
                                ({normalizeAcademicYear(yt.academicYear)}/{yt.semester || 1})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {yt.slots.length} คาบเรียน
                          </p>
                          <p className="text-[10px] text-primary truncate" title={yt.defaultRoom}>
                            {yt.defaultRoom}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                      ยังไม่มีการกำหนดตารางเรียนดิจิทัล
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  ระยะเวลาหลักสูตร {item.durationYears} ปี
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* ส่งออก CSV ของหลักสูตรนี้ */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCurriculumCsv(item)}
                    className="h-8 px-2.5 text-xs gap-1 hover:bg-muted cursor-pointer"
                    title="ส่งออกตารางเรียนของหลักสูตรนี้เป็นไฟล์ CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </Button>

                  {/* พิมพ์ / บันทึก PDF ของหลักสูตรนี้ */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintCurriculumPdf(item)}
                    className="h-8 px-2.5 text-xs gap-1 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 cursor-pointer"
                    title="พิมพ์หรือส่งออกตารางเรียนของหลักสูตรนี้เป็น PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </Button>

                  {/* นำเข้า CSV ตรงสู่หลักสูตรนี้ */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleTriggerBatchImport(item.id)}
                    className="h-8 px-2.5 text-xs gap-1 border-dashed hover:bg-muted cursor-pointer"
                    title={`นำเข้าไฟล์ CSV ลงในหลักสูตร "${item.nameTh}"`}
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>นำเข้า</span>
                  </Button>

                  {/* ลบตารางเรียนทั้งหมดของหลักสูตร */}
                  {currTimetables.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCurriculumTimetable(item)}
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="ลบข้อมูลตารางเรียนทั้งหมดของหลักสูตรนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {/* จัดการ / แก้ไขตารางเรียน */}
                  <Button
                    size="sm"
                    onClick={() => handleEditTimetable(item)}
                    className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>จัดการตาราง</span>
                  </Button>
                </div>
              </div>
            </LiyonCard>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground rounded-2xl border border-dashed">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="font-semibold text-foreground text-sm">ไม่พบตารางเรียนที่ตรงกับเงื่อนไขที่เลือก</p>
            <p className="text-xs text-muted-foreground mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยชื่ออื่น</p>
          </div>
        )}
      </div>

      {/* ── TIMETABLE EDITOR DIALOG ── */}
      <LiyonDialog open={isEditorOpen} onOpenChange={setIsEditorOpen} wide className="!max-w-6xl w-[96vw]">
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={`จัดการตารางการเรียนการสอน: ${editingCurriculum?.nameTh || ""}`}
          description={`กำหนดข้อมูลปีการศึกษา ภาคเรียน ห้องเรียน และคาบเรียนรายวิชา (${editingCurriculum?.majorTh || "สาขาวิชา"})`}
        />
        <LiyonDialogBody className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Quick Preset Buttons */}
          <div className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-foreground">เทมเพลตข้อมูลตารางเรียนจากเอกสารจริง</p>
              <p className="text-[11px] text-muted-foreground">
                โหลดตารางเรียนวิชา คณาจารย์ และห้องเรียนจากเอกสาร มจร. เข้าสู่ระบบอัตโนมัติ
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setTimetables(SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE);
                  setActiveYearLevel(1);
                  toast.success("โหลดตารางเรียนสาขาวิชาศาสนาและปรัชญา เรียบร้อยแล้ว");
                }}
              >
                โหลดสาขาศาสนาและปรัชญา
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setTimetables(SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE);
                  setActiveYearLevel(1);
                  toast.success("โหลดตารางเรียน Buddhist Studies (English) เรียบร้อยแล้ว");
                }}
              >
                โหลด Buddhist Studies (EN)
              </Button>
            </div>
          </div>

          {/* Year Tabs */}
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {timetables.map((yt, ytIdx) => (
                <button
                  key={`${yt.yearLevel}_${yt.academicYear || "default"}_${yt.semester || 1}_${ytIdx}`}
                  type="button"
                  onClick={() => setActiveYearLevel(yt.yearLevel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeYearLevel === yt.yearLevel
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  ชั้นปีที่ {yt.yearLevel} ({yt.slots.length})
                </button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddYear}
                className="h-8 text-xs gap-1 text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มชั้นปี</span>
              </Button>
            </div>

            {currentYearTimetable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteYear(currentYearTimetable.yearLevel)}
                className="h-8 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>ลบชั้นปีที่ {currentYearTimetable.yearLevel}</span>
              </Button>
            )}
          </div>

          {/* Current Year Timetable Details */}
          {currentYearTimetable ? (
            <div className="space-y-4">
              {/* Year Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <LiyonField label="ปีการศึกษา">
                  <input
                    type="text"
                    value={currentYearTimetable.academicYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTimetables((prev) =>
                        prev.map((t) =>
                          t.yearLevel === activeYearLevel ? { ...t, academicYear: val } : t
                        )
                      );
                    }}
                    placeholder="2569 หรือ 2026"
                  />
                </LiyonField>

                <LiyonField label="ภาคการศึกษา">
                  <LiyonSelect
                    value={currentYearTimetable.semester}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 1;
                      setTimetables((prev) =>
                        prev.map((t) =>
                          t.yearLevel === activeYearLevel ? { ...t, semester: val } : t
                        )
                      );
                    }}
                  >
                    <option value={1}>ภาคการศึกษาที่ 1</option>
                    <option value={2}>ภาคการศึกษาที่ 2</option>
                    <option value={3}>ภาคฤดูร้อน</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="ห้องเรียนประจำ">
                  <input
                    type="text"
                    value={currentYearTimetable.defaultRoom}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTimetables((prev) =>
                        prev.map((t) =>
                          t.yearLevel === activeYearLevel ? { ...t, defaultRoom: val } : t
                        )
                      );
                    }}
                    placeholder="เช่น ชั้น 5 ห้อง D 516/1"
                  />
                </LiyonField>

                <LiyonField
                  label="วันเปิดภาคเรียน (ปฏิทิน)"
                  hint={currentYearTimetable.startDate ? dateToThaiString(currentYearTimetable.startDate) : undefined}
                >
                  <input
                    type="date"
                    value={toDateInputValue(currentYearTimetable.startDate)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const thaiStr = val ? dateToThaiString(val) : "";
                      setTimetables((prev) =>
                        prev.map((t) =>
                          t.yearLevel === activeYearLevel
                            ? { ...t, startDate: thaiStr }
                            : t
                        )
                      );
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                  />
                </LiyonField>

                <LiyonField
                  label="วันสิ้นสุดภาคเรียน (ปฏิทิน)"
                  hint={currentYearTimetable.endDate ? dateToThaiString(currentYearTimetable.endDate) : undefined}
                >
                  <input
                    type="date"
                    value={toDateInputValue(currentYearTimetable.endDate)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const thaiStr = val ? dateToThaiString(val) : "";
                      setTimetables((prev) =>
                        prev.map((t) =>
                          t.yearLevel === activeYearLevel
                            ? { ...t, endDate: thaiStr }
                            : t
                        )
                      );
                    }}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                  />
                </LiyonField>
              </div>

              {/* Slots Table and Batch Actions Toolbar */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>รายการคาบเรียนในสัปดาห์ ({currentYearTimetable.slots.length} คาบ)</span>
                  </h4>

                  {/* Batch Tools & Add Slot */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Hidden CSV File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,text/csv"
                      onChange={handleFileImport}
                      className="hidden"
                    />

                    {/* CSV Import */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTriggerCsvUpload}
                      className="h-7 text-xs gap-1 border-dashed hover:bg-muted"
                      title="อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อมูลคาบเรียนเป็นชุด"
                    >
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>นำเข้า CSV</span>
                    </Button>

                    {/* CSV Template */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadTemplateCsv}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      title="ดาวน์โหลดไฟล์เทมเพลต CSV เปล่าสำหรับนำไปกรอกข้อมูล"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>เทมเพลต CSV</span>
                    </Button>

                    {/* CSV Export */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportCsv}
                      className="h-7 text-xs gap-1 hover:bg-muted"
                      title="ส่งออกรายการคาบเรียนของชั้นปีนี้เป็นไฟล์ CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ส่งออก CSV</span>
                    </Button>

                    {/* PDF Print / Export */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportPdf}
                      className="h-7 text-xs gap-1 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                      title="พิมพ์หรือบันทึกตารางเรียนเป็นเอกสาร PDF ทางการ (A4 แนวนอน)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์ / PDF</span>
                    </Button>

                    {/* Add Slot */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleOpenAddSlot}
                      className="h-7.5 px-3 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-2xs ml-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มคาบเรียน</span>
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-card overflow-x-auto max-h-[48vh] overflow-y-auto shadow-2xs">
                  <table className="w-full min-w-[840px] text-xs text-left border-collapse">
                    <thead className="bg-muted/75 border-b text-muted-foreground font-semibold sticky top-0 z-20">
                      <tr>
                        <th className="py-2.5 px-3 w-28 min-w-[100px]">วัน</th>
                        <th className="py-2.5 px-3 w-28 min-w-[105px]">เวลา</th>
                        <th className="py-2.5 px-3 w-24 min-w-[95px]">รหัสวิชา</th>
                        <th className="py-2.5 px-3 min-w-[170px]">ชื่อรายวิชา</th>
                        <th className="py-2.5 px-3 min-w-[180px]">อาจารย์ผู้สอน</th>
                        <th className="py-2.5 px-3 w-24 min-w-[90px]">ห้องเรียน</th>
                        <th className="py-2.5 px-3 w-16 text-center">สอบกลาง</th>
                        <th className="py-2.5 px-3 w-44 min-w-[180px] text-center sticky right-0 bg-muted/95 backdrop-blur-xs z-30 border-l border-border/60 shadow-xs">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentYearTimetable.slots.map((slot, sIdx) => (
                        <tr key={sIdx} className="hover:bg-muted/15 transition-colors group">
                          <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              {DAY_OPTIONS.find((d) => d.value === slot.day)?.th || slot.day}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                            {slot.timeRange}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                            {slot.courseCode}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {slot.courseName}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[220px]" title={slot.instructors}>
                            {slot.instructors}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                            {slot.room || currentYearTimetable.defaultRoom}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {slot.isMidtermExam ? (
                              <span className="text-red-500 font-bold font-mono">*</span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-2 px-3 text-center sticky right-0 bg-card group-hover:bg-muted/15 backdrop-blur-xs z-10 border-l border-border/60 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* ปุ่มแก้ไข */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditSlot(sIdx)}
                                className="h-6.5 px-2 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                                title="แก้ไขข้อมูลคาบเรียนนี้"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>แก้ไข</span>
                              </Button>

                              {/* ปุ่มเพิ่มซ้ำ / คัดลอก */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDuplicateSlot(sIdx)}
                                className="h-6.5 px-2 text-[11px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                                title="เพิ่มคาบเรียนโดยคัดลอกจากรายการนี้"
                              >
                                <Copy className="w-3 h-3" />
                                <span>เพิ่มซ้ำ</span>
                              </Button>

                              {/* ปุ่มลบ */}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSlot(sIdx)}
                                className="h-6.5 px-2 text-[11px] gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="ลบคาบเรียนนี้"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>ลบ</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentYearTimetable.slots.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-muted-foreground">
                            <p className="font-medium text-foreground">ยังไม่มีข้อมูลคาบเรียนในชั้นปีนี้</p>
                            <p className="text-xs mt-1">สามารถกดปุ่ม &quot;+ เพิ่มคาบเรียน&quot; ด้านบนเพื่อเริ่มกำหนดตารางเรียน</p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleOpenAddSlot}
                              className="mt-3 gap-1.5 bg-primary text-primary-foreground text-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ เพิ่มคาบเรียนแรก</span>
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              ยังไม่มีข้อมูลชั้นปี กรุณากด &quot;เพิ่มชั้นปี&quot; ด้านบน
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditorOpen(false)}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSaveAllTimetables}
            disabled={saving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกตารางเรียนทั้งหมด"}</span>
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ── SLOT EDIT MODAL ── */}
      <LiyonDialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={editingSlotIndex !== null ? "แก้ไขคาบเรียน" : "เพิ่มคาบเรียนใหม่"}
          description="กรอกข้อมูลวัน เวลา รหัสวิชา อาจารย์ และห้องเรียน"
        />
        <form onSubmit={handleSaveSlot}>
          <LiyonDialogBody className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label="วันในสัปดาห์ *">
                <LiyonSelect
                  value={slotForm.day}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, day: e.target.value as TimetableSlot["day"] })
                  }
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.th} ({d.en})
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="ช่วงเวลาเรียน *" hint="เช่น 09.00-11.30 หรือ 12.30-15.10">
                <input
                  type="text"
                  required
                  value={slotForm.timeRange}
                  onChange={(e) => setSlotForm({ ...slotForm, timeRange: e.target.value })}
                  placeholder="09.00-11.30"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label="รหัสวิชา *" hint="เช่น 000 102 หรือ 101 101">
                <input
                  type="text"
                  required
                  value={slotForm.courseCode}
                  onChange={(e) => setSlotForm({ ...slotForm, courseCode: e.target.value })}
                  placeholder="000 102"
                />
              </LiyonField>

              <div className="sm:col-span-2">
                <LiyonField label="ชื่อรายวิชา *" hint="เช่น กฎหมายทั่วไป หรือ Buddhism and Science">
                  <input
                    type="text"
                    required
                    value={slotForm.courseName}
                    onChange={(e) => setSlotForm({ ...slotForm, courseName: e.target.value })}
                    placeholder="กฎหมายทั่วไป"
                  />
                </LiyonField>
              </div>
            </div>

            <LiyonField label="อาจารย์ผู้สอน *" hint="เช่น พระมหามงคลกานต์ ฐิตธมฺโม, รศ. ดร.* / อ.ดร.คงชิต">
              <input
                type="text"
                value={slotForm.instructors}
                onChange={(e) => setSlotForm({ ...slotForm, instructors: e.target.value })}
                placeholder="ระบุชื่อและตำแหน่งทางวิชาการ..."
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <LiyonField label="ห้องเรียน (ถ้าต่างจากห้องประจำ)">
                <input
                  type="text"
                  value={slotForm.room || ""}
                  onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                  placeholder={currentYearTimetable?.defaultRoom || "เช่น D 220/2"}
                />
              </LiyonField>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="midterm"
                  checked={slotForm.isMidtermExam || false}
                  onChange={(e) => setSlotForm({ ...slotForm, isMidtermExam: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="midterm" className="text-xs font-medium cursor-pointer">
                  เป็นรายวิชาที่มีข้อสอบกลาง (*)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
              <LiyonField label="คาบเริ่มต้น (ไม่บังคับ)" hint="เว้นว่างเพื่อให้ระบบคำนวณอัตโนมัติ">
                <LiyonSelect
                  value={slotForm.startPeriod || ""}
                  onChange={(e) =>
                    setSlotForm({
                      ...slotForm,
                      startPeriod: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">คำนวณอัตโนมัติตามช่วงเวลา</option>
                  <option value="1">คาบที่ 1 (09.00 - 09.50)</option>
                  <option value="2">คาบที่ 2 (09.50 - 10.40)</option>
                  <option value="3">คาบที่ 3 (10.50 - 11.30)</option>
                  <option value="4">คาบที่ 4 (12.30 - 13.20)</option>
                  <option value="5">คาบที่ 5 (13.20 - 14.10)</option>
                  <option value="6">คาบที่ 6 (14.20 - 15.10)</option>
                  <option value="7">คาบที่ 7 (15.10 - 16.50)</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="จำนวนคาบที่ครอบคลุม (Colspan)" hint="จำนวนคาบต่อเนื่อง">
                <LiyonSelect
                  value={slotForm.periodSpan || ""}
                  onChange={(e) =>
                    setSlotForm({
                      ...slotForm,
                      periodSpan: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">คำนวณอัตโนมัติตามช่วงเวลา</option>
                  <option value="1">1 คาบ</option>
                  <option value="2">2 คาบ (เช่น 2 คาบเรียน)</option>
                  <option value="3">3 คาบ (เช่น 3 คาบเรียนเต็มช่วง)</option>
                </LiyonSelect>
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSlotDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">
              {editingSlotIndex !== null ? "บันทึกการแก้ไข" : "เพิ่มคาบเรียน"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* ── BATCH IMPORT MODAL ── */}
      <LiyonDialog open={isBatchImportOpen} onOpenChange={setIsBatchImportOpen} wide>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="นำเข้าชุดข้อมูลตารางเรียนจากไฟล์ CSV (Batch Import)"
          description={`ตรวจสอบข้อมูลและยืนยันการบันทึกคาบเรียนเข้าสู่ระบบ (ไฟล์: ${batchImportData?.fileName || "-"})`}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {batchImportData && (
            <>
              {/* Summary Stats */}
              <div className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>ไฟล์: {batchImportData.fileName}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ตรวจพบข้อมูลคาบเรียนทั้งหมด {batchImportData.items.length} รายการ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                    {batchImportData.items.length} คาบเรียน
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LiyonField label="นำเข้าสู่หลักสูตร" hint="เลือกหลักสูตรที่ต้องการบันทึกข้อมูล">
                  <LiyonSelect
                    value={batchTargetCurriculumId}
                    onChange={(e) => setBatchTargetCurriculumId(e.target.value)}
                  >
                    <option value="AUTO">🎯 ตรวจหาและจับคู่อัตโนมัติตามชื่อหลักสูตรในไฟล์</option>
                    {items.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameTh} {c.majorTh ? `(${c.majorTh})` : ""}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="รูปแบบการบันทึกข้อมูล" hint="การจัดการกับตารางเรียนเดิมที่มีอยู่">
                  <LiyonSelect
                    value={batchImportMode}
                    onChange={(e) => setBatchImportMode(e.target.value as "append" | "replace")}
                  >
                    <option value="append">เพิ่มต่อท้ายข้อมูลเดิม (Append Slots)</option>
                    <option value="replace">แทนที่ข้อมูลตารางเรียนเดิม (Replace Existing Slots)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    ตัวอย่างรายการข้อมูลที่จะนำเข้า (แสดง {Math.min(batchImportData.items.length, 10)} จาก {batchImportData.items.length} รายการ)
                  </span>
                </div>

                <div className="rounded-xl border overflow-hidden max-h-[35vh] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b text-muted-foreground font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3 w-16">ชั้นปี</th>
                        <th className="py-2 px-3 w-24">วัน</th>
                        <th className="py-2 px-3 w-24">เวลา</th>
                        <th className="py-2 px-3 w-24">รหัสวิชา</th>
                        <th className="py-2 px-3 min-w-[150px]">ชื่อรายวิชา</th>
                        <th className="py-2 px-3 min-w-[150px]">อาจารย์ผู้สอน</th>
                        <th className="py-2 px-3 w-24">ห้องเรียน</th>
                        <th className="py-2 px-3 w-16 text-center">สอบกลาง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {batchImportData.items.slice(0, 15).map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="py-2 px-3 font-bold text-center">ปี {item.yearLevel}</td>
                          <td className="py-2 px-3">{DAY_OPTIONS.find((d) => d.value === item.slot.day)?.th || item.slot.day}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{item.slot.timeRange}</td>
                          <td className="py-2 px-3 font-mono font-bold text-primary">{item.slot.courseCode}</td>
                          <td className="py-2 px-3 font-medium text-foreground">{item.slot.courseName}</td>
                          <td className="py-2 px-3 text-muted-foreground truncate max-w-[180px]">{item.slot.instructors}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.slot.room || "-"}</td>
                          <td className="py-2 px-3 text-center">
                            {item.slot.isMidtermExam ? <span className="text-red-500 font-bold">*</span> : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsBatchImportOpen(false)}
            disabled={batchSaving}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleConfirmBatchImport}
            disabled={batchSaving}
            className="gap-1.5 bg-primary text-primary-foreground cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>
              {batchSaving
                ? "กำลังบันทึกข้อมูล..."
                : `ยืนยันนำเข้าข้อมูล (${batchImportData?.items.length || 0} รายการ)`}
            </span>
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
