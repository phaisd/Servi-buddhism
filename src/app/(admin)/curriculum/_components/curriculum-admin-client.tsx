/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Upload,
  Loader2,
  BookOpen,
  Landmark,
  ExternalLink,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  LiyonField,
  LiyonSelect,
  LiyonSwitch,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  toggleCurriculumActiveAction,
  uploadCurriculumImageAction,
  uploadCurriculumDocumentAction,
  getDepartmentsAction,
} from "@/features/curriculum/actions";
import {
  extractTimetableData,
  injectTimetableData,
  type YearTimetable,
  SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE,
  SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE,
} from "@/features/curriculum";
import type { Curriculum, Department, DegreeLevel } from "@/generated/prisma";

type CurriculumWithDept = Curriculum & {
  department?: Department | null;
  majorTh?: string | null;
  majorEn?: string | null;
  language?: string | null;
};

interface CurriculumAdminClientProps {
  initialItems: CurriculumWithDept[];
  departments: Department[];
}

const DEGREE_LABELS: Record<DegreeLevel, { th: string; en: string }> = {
  BACHELOR: { th: "ปริญญาตรี", en: "Bachelor's" },
  MASTER: { th: "ปริญญาโท", en: "Master's" },
  DOCTORATE: { th: "ปริญญาเอก", en: "Doctorate" },
  CERTIFICATE: { th: "ประกาศนียบัตร", en: "Certificate" },
};

const LANGUAGE_LABELS: Record<string, { th: string; en: string; icon: string; badgeClass: string }> = {
  TH: {
    th: "ภาษาไทย",
    en: "Thai Program",
    icon: "🇹🇭",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  EN: {
    th: "ภาษาอังกฤษ",
    en: "English Program",
    icon: "🇬🇧",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

export function CurriculumAdminClient({
  initialItems,
  departments: initialDepartments,
}: CurriculumAdminClientProps) {
  const t = useT();
  const [items, setItems] = React.useState<CurriculumWithDept[]>(initialItems);
  const [departments, setDepartments] = React.useState<Department[]>(initialDepartments);
  const [search, setSearch] = React.useState("");
  const [filterDegree, setFilterDegree] = React.useState<string>("ALL");
  const [filterDept, setFilterDept] = React.useState<string>("ALL");
  const [filterMajor, setFilterMajor] = React.useState<string>("ALL");
  const [filterActive, setFilterActive] = React.useState<string>("ALL");
  const [filterLanguage, setFilterLanguage] = React.useState<string>("ALL");

  // Dialog state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CurriculumWithDept | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<CurriculumWithDept | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Upload image & document state
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [isDraggingImage, setIsDraggingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [uploadingDoc, setUploadingDoc] = React.useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = React.useState(false);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    nameTh: "",
    nameEn: "",
    degree: "BACHELOR" as DegreeLevel,
    durationYears: 4,
    departmentId: "",
    majorTh: "",
    majorEn: "",
    language: "TH" as "TH" | "EN",
    descriptionTh: "",
    descriptionEn: "",
    imageUrl: "",
    documentUrl: "",
    documentName: "",
    timetables: [] as YearTimetable[],
    isActive: true,
    orderIndex: 0,
  });

  // แยกรายชื่อภาควิชาและสาขาวิชา
  const deptList = React.useMemo(() => {
    return departments.filter((d) => !d.type || d.type === "DEPARTMENT");
  }, [departments]);

  const programList = React.useMemo(() => {
    return departments.filter((d) => d.type === "PROGRAM");
  }, [departments]);

  // ฟังก์ชันดึงรายชื่อหน่วยงาน/สาขาวิชาที่เป็นปัจจุบันที่สุดจากฐานข้อมูล
  const refreshDepartments = React.useCallback(async () => {
    try {
      const fresh = await getDepartmentsAction();
      if (fresh && Array.isArray(fresh)) {
        setDepartments(fresh);
      }
    } catch {
      // ignore
    }
  }, []);

  // เมื่อผู้ใช้สลับหน้าต่างกลับมาที่หน้านี้ ให้รีเฟรชข้อมูลสาขาวิชา/ภาควิชาให้เป็นปัจจุบันทันที
  React.useEffect(() => {
    const handleFocus = () => {
      void refreshDepartments();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshDepartments]);

  const openCreateDialog = () => {
    void refreshDepartments();
    setEditingItem(null);
    setFormData({
      nameTh: "",
      nameEn: "",
      degree: "BACHELOR",
      durationYears: 4,
      departmentId: deptList[0]?.id || "",
      majorTh: "",
      majorEn: "",
      language: "TH",
      descriptionTh: "",
      descriptionEn: "",
      imageUrl: "",
      documentUrl: "",
      documentName: "",
      timetables: [],
      isActive: true,
      orderIndex: items.length,
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (item: CurriculumWithDept) => {
    void refreshDepartments();
    setEditingItem(item);

    const { cleanDescTh, cleanDescEn, timetableData } = extractTimetableData(
      item.descriptionTh,
      item.descriptionEn
    );

    setFormData({
      nameTh: item.nameTh,
      nameEn: item.nameEn || "",
      degree: item.degree,
      durationYears: item.durationYears,
      departmentId: item.departmentId || "",
      majorTh: item.majorTh || "",
      majorEn: item.majorEn || "",
      language: ((item.language === "EN" ? "EN" : "TH") as "TH" | "EN"),
      descriptionTh: cleanDescTh,
      descriptionEn: cleanDescEn,
      imageUrl: item.imageUrl || "",
      documentUrl: timetableData?.documentUrl || "",
      documentName: timetableData?.documentName || "",
      timetables: timetableData?.timetables || [],
      isActive: item.isActive,
      orderIndex: item.orderIndex,
    });
    setIsFormOpen(true);
  };

  const handleImageFile = async (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์ PNG, JPEG, WebP และ SVG เท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    setUploadingImage(true);
    try {
      const res = await uploadCurriculumImageAction(fd);
      if (res.ok && res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url! }));
        toast.success("อัปโหลดรูปภาพสำเร็จ");
      } else {
        toast.error(res.error || "อัปโหลดรูปภาพไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleImageFile(file);
    }
  };

  const handleDocumentFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    setUploadingDoc(true);
    try {
      const res = await uploadCurriculumDocumentAction(fd);
      if (res.ok && res.url) {
        setFormData((prev) => ({
          ...prev,
          documentUrl: res.url!,
          documentName: res.name || file.name,
        }));
        toast.success("อัปโหลดเอกสารตารางเรียนสำเร็จ");
      } else {
        toast.error(res.error || "อัปโหลดเอกสารไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดเอกสาร");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDropDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleDocumentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameTh.trim()) {
      toast.error("กรุณาระบุชื่อหลักสูตรภาษาไทย");
      return;
    }

    setSubmitting(true);
    try {
      let finalDescTh = formData.descriptionTh.trim();
      const finalDescEn = formData.descriptionEn.trim();

      if (formData.documentUrl || formData.timetables.length > 0) {
        finalDescTh = injectTimetableData(finalDescTh, {
          documentUrl: formData.documentUrl || undefined,
          documentName: formData.documentName || undefined,
          timetables: formData.timetables,
        });
      }

      const payload = {
        nameTh: formData.nameTh.trim(),
        nameEn: formData.nameEn.trim() || null,
        degree: formData.degree,
        durationYears: Number(formData.durationYears) || 4,
        departmentId: formData.departmentId || null,
        majorTh: formData.majorTh.trim() || null,
        majorEn: formData.majorEn.trim() || null,
        language: formData.language,
        descriptionTh: finalDescTh || null,
        descriptionEn: finalDescEn || null,
        imageUrl: formData.imageUrl.trim() || null,
        isActive: formData.isActive,
        orderIndex: Number(formData.orderIndex) || 0,
      };

      if (editingItem) {
        const updated = await updateCurriculumAction(editingItem.id, payload);
        const dept = departments.find((d) => d.id === payload.departmentId) || null;
        setItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...updated, department: dept } : it))
        );

        // If a new major was typed that didn't exist in departments, add it locally
        if (payload.majorTh && !departments.some((d) => d.nameTh === payload.majorTh && d.type === "PROGRAM")) {
          setDepartments((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              tenantId: editingItem.tenantId,
              nameTh: payload.majorTh!,
              nameEn: payload.majorEn || null,
              code: null,
              type: "PROGRAM",
              descriptionTh: `สาขาวิชา ${payload.majorTh}`,
              descriptionEn: null,
              orderIndex: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }

        toast.success("แก้ไขข้อมูลหลักสูตรเรียบร้อยแล้ว");
      } else {
        const created = await createCurriculumAction(payload);
        const dept = departments.find((d) => d.id === payload.departmentId) || null;
        setItems((prev) => [{ ...created, department: dept }, ...prev]);

        // If a new major was typed that didn't exist in departments, add it locally
        if (payload.majorTh && !departments.some((d) => d.nameTh === payload.majorTh && d.type === "PROGRAM")) {
          setDepartments((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              tenantId: created.tenantId,
              nameTh: payload.majorTh!,
              nameEn: payload.majorEn || null,
              code: null,
              type: "PROGRAM",
              descriptionTh: `สาขาวิชา ${payload.majorTh}`,
              descriptionEn: null,
              orderIndex: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }

        toast.success("เพิ่มหลักสูตรใหม่เรียบร้อยแล้ว (บันทึกสาขาวิชาลงในระบบอัตโนมัติ)");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    setSubmitting(true);
    try {
      await deleteCurriculumAction(isDeleting.id);
      setItems((prev) => prev.filter((it) => it.id !== isDeleting.id));
      toast.success("ลบหลักสูตรเรียบร้อยแล้ว");
      setIsDeleting(null);
    } catch {
      toast.error("ไม่สามารถลบหลักสูตรได้");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: CurriculumWithDept) => {
    const nextState = !item.isActive;
    try {
      await toggleCurriculumActiveAction(item.id, nextState);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isActive: nextState } : it))
      );
      toast.success(nextState ? "เปิดการรับสมัครหลักสูตรแล้ว" : "ปิดการรับสมัครหลักสูตรแล้ว");
    } catch {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTh = item.nameTh.toLowerCase().includes(q);
        const matchEn = (item.nameEn || "").toLowerCase().includes(q);
        const matchMajor = (item.majorTh || "").toLowerCase().includes(q);
        const matchDept = (item.department?.nameTh || "").toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchMajor && !matchDept) return false;
      }
      if (filterDegree !== "ALL" && item.degree !== filterDegree) return false;
      if (filterDept !== "ALL") {
        if (filterDept === "NONE" && item.departmentId) return false;
        if (filterDept !== "NONE" && item.departmentId !== filterDept) return false;
      }
      if (filterMajor !== "ALL") {
        if (filterMajor === "NONE" && item.majorTh) return false;
        if (filterMajor !== "NONE" && item.majorTh !== filterMajor) return false;
      }
      if (filterActive !== "ALL") {
        const isActive = filterActive === "ACTIVE";
        if (item.isActive !== isActive) return false;
      }
      if (filterLanguage !== "ALL") {
        if ((item.language || "TH") !== filterLanguage) return false;
      }
      return true;
    });
  }, [items, search, filterDegree, filterDept, filterMajor, filterActive, filterLanguage]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{t("curriculum.title")}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                  {items.length} หลักสูตร
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("curriculum.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/curriculum/departments?type=DEPARTMENT">
            <Button variant="outline" className="gap-2 text-xs">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>จัดการภาควิชา</span>
              <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] text-muted-foreground font-mono">
                {deptList.length}
              </span>
            </Button>
          </Link>
          <Link href="/curriculum/departments?type=PROGRAM">
            <Button variant="outline" className="gap-2 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>จัดการสาขาวิชา</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-[10px] font-mono">
                {programList.length}
              </span>
            </Button>
          </Link>
          <Button onClick={openCreateDialog} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>{t("curriculum.add") || "เพิ่มหลักสูตรใหม่"}</span>
          </Button>
        </div>
      </div>

      {/* ── FILTERS & STATS ── */}
      <LiyonCard className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหลักสูตร, สาขาวิชา, ภาควิชา..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Department Filter (ภาควิชาทั้งหมด) */}
          <div className="w-full md:w-52">
            <LiyonSelect
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full"
            >
              <option value="ALL">🏛️ ภาควิชาทั้งหมด ({deptList.length})</option>
              <option value="NONE">-- ไม่ระบุภาควิชา --</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTh} {d.code ? `(${d.code})` : ""}
                </option>
              ))}
            </LiyonSelect>
          </div>

          {/* Major Filter (สาขาวิชาทั้งหมด) */}
          <div className="w-full md:w-52">
            <LiyonSelect
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="w-full"
            >
              <option value="ALL">📚 สาขาวิชาทั้งหมด ({programList.length})</option>
              <option value="NONE">-- ไม่ระบุสาขาวิชา --</option>
              {programList.map((p) => (
                <option key={p.id} value={p.nameTh}>
                  {p.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          {/* Degree Filter */}
          <div className="w-full md:w-44">
            <LiyonSelect
              value={filterDegree}
              onChange={(e) => setFilterDegree(e.target.value)}
              className="w-full"
            >
              <option value="ALL">ระดับการศึกษาทั้งหมด</option>
              <option value="BACHELOR">ปริญญาตรี</option>
              <option value="MASTER">ปริญญาโท</option>
              <option value="DOCTORATE">ปริญญาเอก</option>
              <option value="CERTIFICATE">ประกาศนียบัตร</option>
            </LiyonSelect>
          </div>

          {/* Language Filter */}
          <div className="w-full md:w-40">
            <LiyonSelect
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full"
            >
              <option value="ALL">ภาษาทั้งหมด</option>
              <option value="TH">🇹🇭 ภาษาไทย</option>
              <option value="EN">🇬🇧 ภาษาอังกฤษ</option>
            </LiyonSelect>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-36">
            <LiyonSelect
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="ACTIVE">เปิดรับสมัคร</option>
              <option value="INACTIVE">ปิดชั่วคราว</option>
            </LiyonSelect>
          </div>
        </div>
      </LiyonCard>

      {/* ── TABLE ── */}
      <LiyonCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs border-b border-border">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[280px]">ชื่อหลักสูตร / สาขาวิชา</th>
                <th className="py-3 px-4">สังกัดภาควิชา</th>
                <th className="py-3 px-4 text-center">ภาษา</th>
                <th className="py-3 px-4">ระดับการศึกษา</th>
                <th className="py-3 px-4">ระยะเวลา</th>
                <th className="py-3 px-4 text-center">สถานะรับสมัคร</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item, index) => {
                const langConfig = LANGUAGE_LABELS[item.language || "TH"] || LANGUAGE_LABELS.TH;
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg border border-border/80 overflow-hidden bg-muted shrink-0">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground text-sm flex items-center gap-2">
                            <span>{item.nameTh}</span>
                          </p>
                          {item.nameEn && (
                            <p className="text-muted-foreground text-xs font-sans">
                              {item.nameEn}
                            </p>
                          )}
                          {item.majorTh && (
                            <p className="text-primary text-[11px] font-medium flex items-center gap-1 mt-0.5">
                              <BookOpen className="w-3 h-3" />
                              <span>สาขาวิชา: {item.majorTh}</span>
                            </p>
                          )}
                          {(() => {
                            const match = (item.descriptionTh || "").match(/<!-- TIMETABLE_DOC:(.*?) -->/) || (item.descriptionEn || "").match(/<!-- TIMETABLE_DOC:(.*?) -->/);
                            if (!match) return null;
                            let docUrl = "";
                            try {
                              const parsed = JSON.parse(match[1]);
                              docUrl = parsed.url;
                            } catch {
                              docUrl = match[1];
                            }
                            return (
                              <div className="mt-1">
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>มีตารางเรียน / แผนการศึกษา</span>
                                </a>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.department ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-medium border border-border/80">
                          <Landmark className="w-3.5 h-3.5 text-primary" />
                          <span>{item.department.nameTh}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs italic">
                          ยังไม่ระบุภาควิชา
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${langConfig.badgeClass}`}>
                        <span>{langConfig.icon}</span>
                        <span>{langConfig.th}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground font-medium text-[11px]">
                        <GraduationCap className="w-3 h-3 text-muted-foreground" />
                        <span>{DEGREE_LABELS[item.degree]?.th || item.degree}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{item.durationYears} ปี</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className="cursor-pointer inline-flex items-center transition-transform hover:scale-105"
                        title={item.isActive ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
                      >
                        <StatusPill tone={item.isActive ? "ok" : "off"}>
                          {item.isActive ? "เปิดรับสมัคร / ใช้งาน" : "ปิดชั่วคราว"}
                        </StatusPill>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/portal/programs/${item.id}/timetable`}
                          target="_blank"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="ดูหน้าตารางเรียนออนไลน์"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(item)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="แก้ไขหลักสูตร"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsDeleting(item)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          title="ลบหลักสูตร"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium">ไม่พบข้อมูลหลักสูตรที่ตรงกับเงื่อนไข</p>
                    <p className="text-[11px] mt-1">สามารถกด &ldquo;เพิ่มหลักสูตรใหม่&rdquo; เพื่อสร้างข้อมูลได้ทันที</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>

      {/* ── CREATE / EDIT DIALOG ── */}
      <LiyonDialog open={isFormOpen} onOpenChange={setIsFormOpen} wide>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={editingItem ? "แก้ไขข้อมูลหลักสูตร" : "เพิ่มหลักสูตรใหม่"}
          description="กรอกข้อมูลหลักสูตรการศึกษา สังกัดภาควิชา สาขาวิชา ภาษาที่เรียน และรูปภาพประกอบ"
        />
        <form onSubmit={handleSubmit}>
          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* ชื่อหลักสูตร */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label="ชื่อหลักสูตร (ภาษาไทย) *" hint="เช่น พุทธศาสตรบัณฑิต">
                <input
                  type="text"
                  required
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  placeholder="พุทธศาสตรบัณฑิต"
                />
              </LiyonField>
              <LiyonField label="ชื่อหลักสูตร (ภาษาอังกฤษ)" hint="เช่น Bachelor of Arts in Buddhism">
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Bachelor of Arts in Buddhism"
                />
              </LiyonField>
            </div>

            {/* สังกัดภาควิชา & สาขาวิชา */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-foreground">สังกัดภาควิชา</span>
                    <Link
                      href="/curriculum/departments"
                      className="text-[11px] text-primary hover:underline font-normal inline-flex items-center gap-1"
                      target="_blank"
                    >
                      <Landmark className="w-3 h-3" />
                      <span>จัดการภาควิชา</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                }
                hint="เลือกภาควิชาที่หลักสูตรสังกัด (ภาควิชาพระพุทธศาสนา, ภาควิชาศาสนาและปรัชญา, ฯลฯ)"
              >
                <LiyonSelect
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">-- ไม่ระบุภาควิชา --</option>
                  {deptList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTh} {d.code ? `(${d.code})` : ""}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>

              <LiyonField
                label={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-foreground">สาขาวิชา (Major)</span>
                    <Link
                      href="/curriculum/departments?type=PROGRAM"
                      className="text-[11px] text-primary hover:underline font-normal inline-flex items-center gap-1"
                      target="_blank"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>จัดการสาขาวิชา ({programList.length})</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                }
                hint="เลือกจากสาขาวิชาในระบบ หรือพิมพ์ชื่อใหม่ (ระบบจะบันทึกเป็นสาขาวิชาใหม่อัตโนมัติ)"
              >
                <div className="space-y-1.5">
                  {programList.length > 0 && (
                    <LiyonSelect
                      value={formData.majorTh}
                      onChange={(e) => {
                        const val = e.target.value;
                        const prog = programList.find((p) => p.nameTh === val);
                        setFormData({
                          ...formData,
                          majorTh: val,
                          majorEn: prog?.nameEn || formData.majorEn,
                        });
                      }}
                    >
                      <option value="">-- เลือกจากสาขาวิชาที่ลงทะเบียนไว้ --</option>
                      {programList.map((p) => (
                        <option key={p.id} value={p.nameTh}>
                          {p.nameTh} {p.nameEn ? `(${p.nameEn})` : ""}
                        </option>
                      ))}
                    </LiyonSelect>
                  )}
                  <input
                    type="text"
                    value={formData.majorTh}
                    onChange={(e) => setFormData({ ...formData, majorTh: e.target.value })}
                    placeholder="พิมพ์ชื่อสาขาวิชา เช่น สาขาวิชาพระพุทธศาสนา"
                  />
                </div>
              </LiyonField>
            </div>

            {/* ระดับ, ระยะเวลา, ภาษาหลักสูตร */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label="ระดับการศึกษา" hint="วุฒิการศึกษา">
                <LiyonSelect
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value as DegreeLevel })
                  }
                >
                  <option value="BACHELOR">ปริญญาตรี (Bachelor)</option>
                  <option value="MASTER">ปริญญาโท (Master)</option>
                  <option value="DOCTORATE">ปริญญาเอก (Doctorate)</option>
                  <option value="CERTIFICATE">ประกาศนียบัตร (Certificate)</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="ระยะเวลาศึกษา (ปี)" hint="จำนวนปีตามเกณฑ์">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.durationYears}
                  onChange={(e) =>
                    setFormData({ ...formData, durationYears: Number(e.target.value) || 1 })
                  }
                />
              </LiyonField>

              <LiyonField label="ภาษาที่ใช้ในการเรียนการสอน" hint="ภาษาของหลักสูตร">
                <LiyonSelect
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value as "TH" | "EN" })
                  }
                >
                  <option value="TH">🇹🇭 ภาษาไทย (Thai)</option>
                  <option value="EN">🇬🇧 ภาษาอังกฤษ (English)</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            {/* คำอธิบาย */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label="รายละเอียดหลักสูตร (ภาษาไทย)">
                <textarea
                  rows={3}
                  value={formData.descriptionTh}
                  onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                  placeholder="คำอธิบาย วัตถุประสงค์ หรือจุดเด่นของหลักสูตร..."
                />
              </LiyonField>
              <LiyonField label="รายละเอียดหลักสูตร (ภาษาอังกฤษ)">
                <textarea
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Program overview and academic highlights..."
                />
              </LiyonField>
            </div>

            {/* รูปภาพประกอบ (DRAG & DROP IMAGE UPLOAD) */}
            <LiyonField
              label="รูปภาพประกอบหลักสูตร (Cover Image)"
              hint="ลากไฟล์รูปภาพมาใส่ หรือคลิกเพื่ออัปโหลด (รองรับ PNG, JPEG, WebP, SVG ขนาดไม่เกิน 5MB)"
            >
              <div className="space-y-2">
                {formData.imageUrl ? (
                  <div className="relative rounded-xl border border-border overflow-hidden bg-muted/20 group">
                    <div className="relative aspect-[16/7] w-full max-h-52 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <img
                        src={formData.imageUrl}
                        alt="Curriculum Preview"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <div className="p-2.5 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-between text-xs">
                      <span className="truncate max-w-[280px] sm:max-w-md text-muted-foreground font-mono text-[11px]">
                        {formData.imageUrl}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="h-7 text-xs"
                        >
                          เปลี่ยนรูปภาพ
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setFormData({ ...formData, imageUrl: "" })}
                          disabled={uploadingImage}
                          className="h-7 text-xs"
                        >
                          ลบรูป
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={handleDropImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingImage
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border hover:border-primary/60 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleImageFile(file);
                        e.target.value = "";
                      }}
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-medium">กำลังอัปโหลดรูปภาพ...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-2 text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PNG, JPEG, WebP หรือ SVG (ขนาดไม่เกิน 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ทางเลือกใส่ URL โดยตรง */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="หรือระบุ URL รูปภาพโดยตรง เช่น /uploads/... หรือ https://..."
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
            </LiyonField>

            {/* เอกสารตารางเรียน / แผนการศึกษา (TIMETABLE & SYLLABUS DOCUMENT) */}
            <LiyonField
              label="เอกสารตารางเรียน / แผนการศึกษา (Timetable & Syllabus)"
              hint="อัปโหลดไฟล์ตารางเรียนหรือแผนการศึกษาประจำภาคเรียน (รองรับ PDF, Word, Excel ขนาดไม่เกิน 20MB)"
            >
              <div className="space-y-2">
                {formData.documentUrl ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {formData.documentName || "เอกสารตารางเรียน/แผนการศึกษา"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {formData.documentUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <a
                        href={formData.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>เปิดดูไฟล์</span>
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => docInputRef.current?.click()}
                        disabled={uploadingDoc}
                        className="h-7 text-xs"
                      >
                        เปลี่ยนไฟล์
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData({ ...formData, documentUrl: "", documentName: "" })}
                        disabled={uploadingDoc}
                        className="h-7 text-xs"
                      >
                        ลบ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingDoc(true);
                    }}
                    onDragLeave={() => setIsDraggingDoc(false)}
                    onDrop={handleDropDoc}
                    onClick={() => docInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDraggingDoc
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border hover:border-primary/60 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleDocumentFile(file);
                        e.target.value = "";
                      }}
                    />
                    {uploadingDoc ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2 text-muted-foreground">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                        <p className="text-xs font-medium">กำลังอัปโหลดเอกสาร...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-1 text-muted-foreground">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            คลิกเพื่อเลือกไฟล์ หรือลากเอกสารตารางเรียน (PDF, Word, Excel) มาวางที่นี่
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            รองรับ PDF, DOCX, XLSX ขนาดไม่เกิน 20MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ทางเลือกใส่ URL เอกสารโดยตรง */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    value={formData.documentUrl}
                    onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                    placeholder="หรือระบุ URL เอกสาร เช่น /uploads/... หรือ https://..."
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
            </LiyonField>

            {/* โครงสร้างตารางการเรียนการสอนแบบโต้ตอบ (INTERACTIVE TIMETABLE DATA) */}
            <div className="rounded-xl border border-primary/20 bg-muted/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>ข้อมูลตารางการเรียนการสอนแบบดิจิทัล (Digital Class Timetable)</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    กำหนดรายวิชา คาบเรียน อาจารย์ผู้สอน และห้องเรียน เพื่อแสดงผลบนหน้าพอร์ทัลแบบ Interactive
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => {
                      const isEn = formData.language === "EN" || formData.nameEn.toLowerCase().includes("buddhist");
                      const sample = isEn ? SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE : SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE;
                      setFormData((prev) => ({
                        ...prev,
                        timetables: sample,
                      }));
                      toast.success(`โหลดข้อมูลตารางเรียนตัวอย่าง (${isEn ? "English Program" : "สาขาวิชาศาสนาและปรัชญา"}) เรียบร้อยแล้ว`);
                    }}
                  >
                    <span>⚡ โหลดตารางตัวอย่างจากเอกสาร</span>
                  </Button>
                  {formData.timetables.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setFormData((prev) => ({ ...prev, timetables: [] }))}
                    >
                      ล้างข้อมูล
                    </Button>
                  )}
                </div>
              </div>

              {formData.timetables.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.timetables.map((t, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-card border text-[11px] font-medium flex items-center gap-2 shadow-2xs"
                      >
                        <span className="font-bold text-primary">ชั้นปีที่ {t.yearLevel}</span>
                        <span className="text-muted-foreground font-mono">
                          {t.defaultRoom} ({t.slots.length} วิชา)
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span>✓ พร้อมแสดงผลในหน้าเพจ Interactive Timetable ของนิสิตและคณาจารย์</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed bg-background/50 text-center text-xs text-muted-foreground">
                  ยังไม่ได้ใส่ข้อมูลตารางเรียนดิจิทัล (สามารถคลิกปุ่ม &quot;โหลดตารางตัวอย่างจากเอกสาร&quot; เพื่อทดลองใช้งานได้ทันที)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <LiyonField label="ลำดับการจัดเรียง (Order Index)">
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({ ...formData, orderIndex: Number(e.target.value) || 0 })
                  }
                />
              </LiyonField>

              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 mt-1 sm:mt-5">
                <div>
                  <p className="text-xs font-semibold">เปิดรับสมัคร / แสดงผลบนเว็บไซต์</p>
                  <p className="text-[11px] text-muted-foreground">
                    เมื่อเปิดใช้งาน ผู้ใช้งานหน้า Portal จะมองเห็นหลักสูตรนี้
                  </p>
                </div>
                <LiyonSwitch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : editingItem ? "บันทึกการแก้ไข" : "บันทึกหลักสูตร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <LiyonDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)} danger>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="ยืนยันการลบหลักสูตร"
          description="การดำเนินการนี้ไม่สามารถเรียกคืนได้ ข้อมูลหลักสูตรจะถูกลบออกจากระบบอย่างถาวร"
        />
        <LiyonDialogBody>
          <p className="text-sm text-foreground">
            คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร{" "}
            <span className="font-bold text-destructive">&ldquo;{isDeleting?.nameTh}&rdquo;</span>?
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleting(null)}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
