"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Plus,
  BookOpen,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
} from "lucide-react";
import {
  LiyonCard,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createClassAction,
  updateClassAction,
  deleteClassAction,
} from "@/features/attendance/actions";
import {
  extractTimetableData,
  type YearTimetable,
  type TimetableSlot,
} from "@/features/curriculum";
import type { AttendanceClass, Curriculum, Department } from "@/generated/prisma";
import { parseClassStudents, type AttendanceStudentItem } from "@/features/attendance";

interface EnrichedAttendanceClass extends AttendanceClass {
  sessions?: Array<{
    id: string;
    topic: string | null;
    date: Date;
    _count?: { records: number };
  }>;
}

interface ClassesClientProps {
  initialItems: EnrichedAttendanceClass[];
  curriculums: (Curriculum & { department?: Department | null })[];
}

interface TimetableCourseOption {
  curriculumId: string;
  curriculumName: string;
  majorName?: string;
  yearLevel: number;
  semester: number;
  academicYear: string;
  slot: TimetableSlot;
}

export function ClassesClient({ initialItems, curriculums }: ClassesClientProps) {
  const [items, setItems] = React.useState<EnrichedAttendanceClass[]>(initialItems);
  const [search, setSearch] = React.useState("");
  const [filterTerm, setFilterTerm] = React.useState("ALL");

  // Dialog State: Create / Edit Class
  const [isClassDialogOpen, setIsClassDialogOpen] = React.useState(false);
  const [editingClassId, setEditingClassId] = React.useState<string | null>(null);
  const [savingClass, setSavingClass] = React.useState(false);

  // Form State
  const [courseCode, setCourseCode] = React.useState("");
  const [courseName, setCourseName] = React.useState("");
  const [term, setTerm] = React.useState("1/2569");
  const [instructorName, setInstructorName] = React.useState("");

  // Student Roster in Dialog
  const [students, setStudents] = React.useState<AttendanceStudentItem[]>([]);
  const [newStudentCode, setNewStudentCode] = React.useState("");
  const [newStudentName, setNewStudentName] = React.useState("");
  const [newStudentYear, setNewStudentYear] = React.useState<number>(1);
  const [newStudentMajor, setNewStudentMajor] = React.useState("");
  const [editingStudentIdx, setEditingStudentIdx] = React.useState<number | null>(null);

  // Extract all courses from timetables across curriculums
  const timetableCourseOptions = React.useMemo<TimetableCourseOption[]>(() => {
    const list: TimetableCourseOption[] = [];
    curriculums.forEach((c) => {
      const { timetableData } = extractTimetableData(c.descriptionTh, c.descriptionEn);
      timetableData?.timetables?.forEach((yt: YearTimetable) => {
        yt.slots.forEach((s: TimetableSlot) => {
          list.push({
            curriculumId: c.id,
            curriculumName: c.nameTh,
            majorName: c.majorTh || undefined,
            yearLevel: yt.yearLevel,
            semester: yt.semester,
            academicYear: yt.academicYear || "2569",
            slot: s,
          });
        });
      });
    });
    return list;
  }, [curriculums]);

  // Unique terms list from classes
  const termsList = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => set.add(c.term));
    set.add("1/2569");
    set.add("2/2569");
    set.add("1/2568");
    return Array.from(set);
  }, [items]);

  // Filtered classes
  const filteredClasses = React.useMemo(() => {
    return items.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = c.courseCode.toLowerCase().includes(q);
        const matchName = c.courseName.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      if (filterTerm !== "ALL" && c.term !== filterTerm) return false;
      return true;
    });
  }, [items, search, filterTerm]);

  // Handle Pick from Timetable
  const handleSelectFromTimetable = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (isNaN(idx) || !timetableCourseOptions[idx]) return;
    const opt = timetableCourseOptions[idx];
    setCourseCode(opt.slot.courseCode);
    setCourseName(opt.slot.courseName);
    setTerm(`${opt.semester}/${opt.academicYear}`);
    setInstructorName(opt.slot.instructors || "");
    setNewStudentYear(opt.yearLevel);
    if (opt.majorName) {
      setNewStudentMajor(opt.majorName);
    }
    toast.success(`ดึงข้อมูลรายวิชา "${opt.slot.courseName}" จากตารางสอนสำเร็จ`);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingClassId(null);
    setCourseCode("");
    setCourseName("");
    setTerm("1/2569");
    setInstructorName("");
    setStudents([]);
    setNewStudentCode("");
    setNewStudentName("");
    setNewStudentYear(1);
    setNewStudentMajor("");
    setEditingStudentIdx(null);
    setIsClassDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (c: EnrichedAttendanceClass) => {
    setEditingClassId(c.id);
    setCourseCode(c.courseCode);
    setCourseName(c.courseName);
    setTerm(c.term);
    setInstructorName("");

    // Extract students from roster session if exists
    const rosterSession = c.sessions?.find((s) => s.topic?.includes("<!-- STUDENTS:"));
    const loadedStudents = rosterSession ? parseClassStudents(rosterSession.topic) : [];
    setStudents(loadedStudents);
    setNewStudentCode("");
    setNewStudentName("");
    setNewStudentYear(1);
    setNewStudentMajor("");
    setEditingStudentIdx(null);
    setIsClassDialogOpen(true);
  };

  // Add or Update Student in local state
  const handleAddOrUpdateStudent = () => {
    if (!newStudentCode.trim() || !newStudentName.trim()) {
      toast.error("กรุณาระบุรหัสนิสิต และ ชื่อ-ฉายา/นามสกุล");
      return;
    }

    if (editingStudentIdx !== null) {
      // Update
      const updated = [...students];
      updated[editingStudentIdx] = {
        studentCode: newStudentCode.trim(),
        studentName: newStudentName.trim(),
        yearLevel: newStudentYear,
        major: newStudentMajor.trim() || null,
      };
      setStudents(updated);
      setEditingStudentIdx(null);
      toast.success("แก้ไขข้อมูลนิสิตเรียบร้อยแล้ว");
    } else {
      // Create - check duplicate code
      if (students.some((s) => s.studentCode === newStudentCode.trim())) {
        toast.error(`รหัสนิสิต ${newStudentCode.trim()} มีอยู่ในรายวิชานี้แล้ว`);
        return;
      }
      setStudents([
        ...students,
        {
          studentCode: newStudentCode.trim(),
          studentName: newStudentName.trim(),
          yearLevel: newStudentYear,
          major: newStudentMajor.trim() || null,
        },
      ]);
      toast.success("เพิ่มนิสิตเข้าสู่รายวิชาเรียบร้อยแล้ว");
    }

    // Reset input fields
    setNewStudentCode("");
    setNewStudentName("");
  };

  // Edit single student in list
  const handleStartEditStudent = (idx: number) => {
    const s = students[idx];
    setEditingStudentIdx(idx);
    setNewStudentCode(s.studentCode);
    setNewStudentName(s.studentName);
    setNewStudentYear(s.yearLevel || 1);
    setNewStudentMajor(s.major || "");
  };

  // Delete single student
  const handleDeleteStudent = (idx: number) => {
    const updated = students.filter((_, i) => i !== idx);
    setStudents(updated);
    if (editingStudentIdx === idx) {
      setEditingStudentIdx(null);
      setNewStudentCode("");
      setNewStudentName("");
    }
  };

  // Save Class (Create or Update)
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim() || !term.trim()) {
      toast.error("กรุณากรอกรหัสวิชา ชื่อวิชา และภาค/ปีการศึกษา");
      return;
    }

    setSavingClass(true);
    try {
      if (editingClassId) {
        await updateClassAction(editingClassId, {
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          term: term.trim(),
          students,
        });

        setItems((prev) =>
          prev.map((it) =>
            it.id === editingClassId
              ? {
                  ...it,
                  courseCode: courseCode.trim(),
                  courseName: courseName.trim(),
                  term: term.trim(),
                }
              : it
          )
        );
        toast.success("บันทึกการแก้ไขรายวิชาและบัญชีรายชื่อนิสิตเรียบร้อยแล้ว");
      } else {
        const created = await createClassAction({
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          term: term.trim(),
          students,
        });

        setItems([created as EnrichedAttendanceClass, ...items]);
        toast.success("สร้างรายวิชาและบันทึกบัญชีรายชื่อนิสิตเรียบร้อยแล้ว");
      }
      setIsClassDialogOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSavingClass(false);
    }
  };

  // Delete Class
  const handleDeleteClass = async (c: EnrichedAttendanceClass) => {
    if (!confirm(`คุณต้องการลบรายวิชา "${c.courseName} (${c.courseCode})" ใช่หรือไม่?`)) return;
    try {
      await deleteClassAction(c.id);
      setItems((prev) => prev.filter((it) => it.id !== c.id));
      toast.success("ลบรายวิชาเรียบร้อยแล้ว");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบรายวิชา");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mb-1">
            <UserCheck className="w-4 h-4" />
            <span>ระบบบันทึกเวลาเรียนและกิจกรรม</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ตรวจเช็คการเข้าเรียนของนิสิต (Class Attendance)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            จัดการรายวิชาสอน นำเข้าจากตารางการเรียนการสอน เช็คชื่อเข้าเรียน และจัดการบัญชีรายชื่อนิสิต
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ สร้างรายวิชาใหม่ / ดึงจากตารางสอน</span>
          </Button>

          <Link
            href="/portal/timetables"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors h-9"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>ตารางการเรียนการสอน (Portal)</span>
          </Link>
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <LiyonCard className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัสวิชา, ชื่อวิชา..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background"
            />
          </div>

          <div>
            <LiyonSelect
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full text-xs"
            >
              <option value="ALL">🗓️ ทุกภาคและปีการศึกษา</option>
              {termsList.map((t) => (
                <option key={t} value={t}>
                  ภาคการศึกษา {t}
                </option>
              ))}
            </LiyonSelect>
          </div>
        </div>
      </LiyonCard>

      {/* ── CLASSES GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((item) => {
          const rosterSession = item.sessions?.find((s) => s.topic?.includes("<!-- STUDENTS:"));
          const enrolledStudents = rosterSession ? parseClassStudents(rosterSession.topic) : [];
          const sessionCount = (item.sessions?.length || 0) - (rosterSession ? 1 : 0);

          return (
            <LiyonCard
              key={item.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {item.courseCode}
                    </span>
                    <span className="ml-2 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                      ภาคเรียน {item.term}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="แก้ไขรายวิชาและบัญชีรายชื่อนิสิต"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClass(item)}
                      className="p-1.5 rounded-lg border hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      title="ลบรายวิชานี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground line-clamp-2">
                    {item.courseName}
                  </h3>
                </div>

                {/* Summary badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div className="p-2 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground">นิสิตในชั้นเรียน</p>
                    <p className="font-bold text-sm text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{enrolledStudents.length} รูป/คน</span>
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <p className="text-[10px] text-muted-foreground">คาบที่เช็คชื่อแล้ว</p>
                    <p className="font-bold text-sm text-foreground mt-0.5 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{Math.max(0, sessionCount)} คาบ</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(item)}
                  className="h-8 text-xs gap-1.5 flex-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>จัดการรายชื่อ ({enrolledStudents.length})</span>
                </Button>

                <Link
                  href={`/attendance/classes/${item.id}/sessions`}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-colors shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>เริ่มเช็คชื่อ</span>
                  <span>→</span>
                </Link>
              </div>
            </LiyonCard>
          );
        })}

        {filteredClasses.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground rounded-2xl border border-dashed">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="font-semibold text-foreground text-sm">ไม่พบรายวิชาที่สอนในระบบ</p>
            <p className="text-xs text-muted-foreground mt-1">
              กดปุ่ม &quot;+ สร้างรายวิชาใหม่ / ดึงจากตารางสอน&quot; ด้านบนเพื่อเริ่มต้น
            </p>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT CLASS & ROSTER DIALOG ── */}
      <LiyonDialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen} wide className="!max-w-4xl w-[96vw]">
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={editingClassId ? "แก้ไขรายวิชาและบัญชีรายชื่อนิสิต" : "เพิ่มรายวิชาสอนใหม่สำหรับอาจารย์"}
          description="สามารถเลือกดึงข้อมูลจากตารางการเรียนการสอนอัตโนมัติ หรือกรอกข้อมูลด้วยตนเอง พร้อมกำหนดรายชื่อนิสิต"
        />

        <form onSubmit={handleSaveClass}>
          <LiyonDialogBody className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick Picker from Timetable */}
            {!editingClassId && timetableCourseOptions.length > 0 && (
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    ดึงข้อมูลอัตโนมัติจากตารางการเรียนการสอน (Timetable Quick Select)
                  </span>
                </div>
                <LiyonSelect
                  onChange={handleSelectFromTimetable}
                  className="w-full text-xs font-medium bg-background"
                >
                  <option value="">-- เลือกรายวิชาจากตารางเรียนของมหาวิทยาลัย --</option>
                  {timetableCourseOptions.map((opt, idx) => (
                    <option key={idx} value={idx}>
                      [{opt.slot.courseCode}] {opt.slot.courseName} - {opt.curriculumName} (ชั้นปี {opt.yearLevel} / ภาค {opt.semester} ปี {opt.academicYear})
                    </option>
                  ))}
                </LiyonSelect>
              </div>
            )}

            {/* Class Form Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label="รหัสวิชา *" hint="เช่น 000 102 หรือ 112 305">
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="รหัสวิชา..."
                  required
                />
              </LiyonField>

              <LiyonField label="ชื่อรายวิชา *" hint="เช่น กฎหมายทั่วไป หรือ ภาษาบาลี">
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="ชื่อวิชา..."
                  required
                />
              </LiyonField>

              <LiyonField label="ภาค/ปีการศึกษา *" hint="เช่น 1/2569 หรือ 2/2569">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="1/2569"
                  required
                />
              </LiyonField>
            </div>

            {instructorName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 -mt-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>อาจารย์ผู้สอนตามตาราง: {instructorName}</span>
              </p>
            )}

            {/* ── STUDENT ROSTER MANAGEMENT (เพิ่ม, แก้ไข, ลบ นิสิต) ── */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span>บัญชีรายชื่อนิสิตในรายวิชา ({students.length} รูป/คน)</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    กำหนด รหัส, ชื่อ-ฉายา/นามสกุล, ชั้นปี และสาขาวิชา ของนิสิตสำหรับเช็คชื่อเข้าเรียน
                  </p>
                </div>
              </div>

              {/* Add / Edit Student Sub-form */}
              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
                <p className="text-xs font-bold text-foreground">
                  {editingStudentIdx !== null ? "แก้ไขข้อมูลนิสิต" : "+ เพิ่มนิสิตเข้ารายวิชา"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      รหัสนิสิต *
                    </label>
                    <input
                      type="text"
                      value={newStudentCode}
                      onChange={(e) => setNewStudentCode(e.target.value)}
                      placeholder="เช่น 6601001"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      ชื่อ-ฉายา / นามสกุล *
                    </label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="เช่น พระมหา... / นาย..."
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      ชั้นปี
                    </label>
                    <select
                      value={newStudentYear}
                      onChange={(e) => setNewStudentYear(Number(e.target.value) || 1)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background"
                    >
                      <option value={1}>ชั้นปีที่ 1</option>
                      <option value={2}>ชั้นปีที่ 2</option>
                      <option value={3}>ชั้นปีที่ 3</option>
                      <option value={4}>ชั้นปีที่ 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      สาขาวิชา
                    </label>
                    <input
                      type="text"
                      value={newStudentMajor}
                      onChange={(e) => setNewStudentMajor(e.target.value)}
                      placeholder="เช่น ศาสนาและปรัชญา"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingStudentIdx !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingStudentIdx(null);
                        setNewStudentCode("");
                        setNewStudentName("");
                      }}
                      className="h-7 text-xs"
                    >
                      ยกเลิก
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddOrUpdateStudent}
                    className="h-7.5 text-xs px-3 bg-primary text-primary-foreground font-semibold"
                  >
                    {editingStudentIdx !== null ? "บันทึกการแก้ไขนิสิต" : "+ เพิ่มนิสิต"}
                  </Button>
                </div>
              </div>

              {/* Students Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden max-h-[30vh] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/70 border-b border-border text-muted-foreground font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                      <th className="py-2 px-3 w-28">รหัสนิสิต</th>
                      <th className="py-2 px-3">ชื่อ-ฉายา / นามสกุล</th>
                      <th className="py-2 px-3 w-20 text-center">ชั้นปี</th>
                      <th className="py-2 px-3">สาขาวิชา</th>
                      <th className="py-2 px-3 w-24 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((st, sIdx) => (
                      <tr key={sIdx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-3 text-center text-muted-foreground font-mono">
                          {sIdx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-primary">
                          {st.studentCode}
                        </td>
                        <td className="py-2 px-3 font-medium text-foreground">
                          {st.studentName}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {st.yearLevel ? `ปี ${st.yearLevel}` : "-"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {st.major || "-"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditStudent(sIdx)}
                              className="p-1 rounded text-primary hover:bg-primary/10 cursor-pointer"
                              title="แก้ไขข้อมูลนิสิต"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(sIdx)}
                              className="p-1 rounded text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="ลบนิสิตออกจากรายวิชา"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          ยังไม่มีรายชื่อนิสิตในรายวิชานี้ (สามารถกรอกเพิ่มด้านบนได้)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClassDialogOpen(false)}
              disabled={savingClass}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={savingClass} className="gap-1.5">
              <span>{savingClass ? "กำลังบันทึก..." : "บันทึกรายวิชาและรายชื่อ"}</span>
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
