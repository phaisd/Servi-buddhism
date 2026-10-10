"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  GraduationCap,
  Users,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Landmark,
  RefreshCw,
  ExternalLink,
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
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  toggleDepartmentActiveAction,
  getDepartmentsAction,
} from "@/features/curriculum/actions";
import type { Department, Curriculum } from "@/generated/prisma";

type DepartmentWithCurriculums = Department & {
  curriculums?: Array<Pick<Curriculum, "id" | "nameTh" | "nameEn" | "degree" | "isActive" | "durationYears">>;
  _count?: {
    curriculums?: number;
    personnel?: number;
  };
};

interface DepartmentsAdminClientProps {
  initialItems: DepartmentWithCurriculums[];
}

const TYPE_CONFIG: Record<
  string,
  { labelTh: string; labelEn: string; icon: typeof Building2; color: string }
> = {
  DEPARTMENT: {
    labelTh: "ภาควิชา",
    labelEn: "Department",
    icon: Landmark,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  PROGRAM: {
    labelTh: "สาขาวิชา",
    labelEn: "Program",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  DIVISION: {
    labelTh: "ส่วนงาน / สำนักงาน",
    labelEn: "Division",
    icon: Building2,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

export function DepartmentsAdminClient({ initialItems }: DepartmentsAdminClientProps) {
  const t = useT();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "ALL";

  const [items, setItems] = React.useState<DepartmentWithCurriculums[]>(initialItems);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState(initialType);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Sync fresh data from server
  const refreshDepartments = React.useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const fresh = await getDepartmentsAction();
      if (fresh && Array.isArray(fresh)) {
        setItems(fresh);
      }
    } catch {
      if (!silent) toast.error("ไม่สามารถรีเฟรชข้อมูลได้");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Window focus listener to keep items synchronized when navigating between tabs/windows
  React.useEffect(() => {
    const handleFocus = () => {
      void refreshDepartments(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshDepartments]);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<DepartmentWithCurriculums | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<DepartmentWithCurriculums | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    nameTh: "",
    nameEn: "",
    code: "",
    type: "DEPARTMENT",
    affiliatedDept: "",
    descriptionTh: "",
    descriptionEn: "",
    orderIndex: 0,
    isActive: true,
  });

  // Department list for selection
  const departmentOptions = React.useMemo(() => {
    return items.filter(
      (it) => (!it.type || it.type === "DEPARTMENT") && it.id !== editingItem?.id
    );
  }, [items, editingItem]);

  // Mapping of departments to their affiliated programs (สาขาวิชาในสังกัด)
  const affiliatedProgramsByDept = React.useMemo(() => {
    const map = new Map<string, DepartmentWithCurriculums[]>();
    const programs = items.filter((it) => it.type === "PROGRAM");
    for (const prog of programs) {
      const desc = prog.descriptionTh || "";
      const parentDept = departmentOptions.find((d) => desc.includes(d.nameTh));
      if (parentDept) {
        const list = map.get(parentDept.id) || [];
        list.push(prog);
        map.set(parentDept.id, list);
      }
    }
    return map;
  }, [items, departmentOptions]);

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      nameTh: "",
      nameEn: "",
      code: "",
      type: filterType !== "ALL" ? filterType : "DEPARTMENT",
      affiliatedDept: "",
      descriptionTh: "",
      descriptionEn: "",
      orderIndex: items.length,
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const openEditDialog = (item: DepartmentWithCurriculums) => {
    setEditingItem(item);
    // Detect affiliated department if stored in description or notes
    let matchedDept = "";
    if (item.type === "PROGRAM") {
      const desc = item.descriptionTh || "";
      const matched = departmentOptions.find((d) => desc.includes(d.nameTh));
      if (matched) {
        matchedDept = matched.nameTh;
      }
    }

    setFormData({
      nameTh: item.nameTh,
      nameEn: item.nameEn || "",
      code: item.code || "",
      type: item.type || "DEPARTMENT",
      affiliatedDept: matchedDept,
      descriptionTh: item.descriptionTh || "",
      descriptionEn: item.descriptionEn || "",
      orderIndex: item.orderIndex,
      isActive: item.isActive !== false,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameTh.trim()) {
      toast.error("กรุณาระบุชื่อภาษาไทย");
      return;
    }

    setSubmitting(true);
    try {
      // Build descriptionTh incorporating affiliated department if selected
      let finalDescTh = formData.descriptionTh.trim();
      if (formData.type === "PROGRAM" && formData.affiliatedDept) {
        if (!finalDescTh) {
          finalDescTh = `สังกัด${formData.affiliatedDept}`;
        } else if (!finalDescTh.includes(formData.affiliatedDept)) {
          finalDescTh = `${finalDescTh} (${formData.affiliatedDept})`;
        }
      }

      const payload = {
        nameTh: formData.nameTh.trim(),
        nameEn: formData.nameEn.trim() || null,
        code: formData.code.trim().toUpperCase() || null,
        type: formData.type,
        descriptionTh: finalDescTh || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        orderIndex: Number(formData.orderIndex) || 0,
        isActive: formData.isActive,
      };

      if (editingItem) {
        const updated = await updateDepartmentAction(editingItem.id, payload);
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingItem.id
              ? {
                  ...it,
                  ...updated,
                  curriculums: it.curriculums,
                  _count: it._count,
                }
              : it
          )
        );
        toast.success("แก้ไขข้อมูลหน่วยงานเรียบร้อยแล้ว");
      } else {
        const created = await createDepartmentAction(payload);
        setItems((prev) => [
          ...prev,
          {
            ...created,
            curriculums: [],
            _count: { curriculums: 0, personnel: 0 },
          },
        ]);
        toast.success("เพิ่มหน่วยงานใหม่เรียบร้อยแล้ว");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: DepartmentWithCurriculums) => {
    const nextState = item.isActive === false ? true : false;
    try {
      await toggleDepartmentActiveAction(item.id, nextState);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isActive: nextState } : it))
      );
      toast.success(nextState ? "เปิดการใช้งานหน่วยงานแล้ว" : "ปิดการใช้งานหน่วยงานชั่วคราว");
    } catch {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    setSubmitting(true);
    try {
      await deleteDepartmentAction(isDeleting.id);
      setItems((prev) => prev.filter((it) => it.id !== isDeleting.id));
      toast.success("ลบหน่วยงานเรียบร้อยแล้ว");
      setIsDeleting(null);
    } catch {
      toast.error("ไม่สามารถลบหน่วยงานได้");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Stats
  const totalCurriculums = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item._count?.curriculums ?? item.curriculums?.length ?? 0), 0);
  }, [items]);

  // Filtered
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTh = item.nameTh.toLowerCase().includes(q);
        const matchEn = (item.nameEn || "").toLowerCase().includes(q);
        const matchCode = (item.code || "").toLowerCase().includes(q);
        if (!matchTh && !matchEn && !matchCode) return false;
      }
      if (filterType !== "ALL" && (item.type || "DEPARTMENT") !== filterType) return false;
      return true;
    });
  }, [items, search, filterType]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{t("curriculum.departments_title")}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                  {items.length} หน่วยงาน
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("curriculum.departments_subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshDepartments(false)}
            disabled={isRefreshing}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="รีเฟรชข้อมูลล่าสุด"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>{isRefreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}</span>
          </Button>
          <Link href="/curriculum">
            <Button variant="outline" className="gap-2 text-xs">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>ดูหลักสูตรทั้งหมด</span>
              <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] text-muted-foreground">
                {totalCurriculums}
              </span>
            </Button>
          </Link>
          <Button onClick={openCreateDialog} className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            <span>เพิ่มภาควิชา / สาขาวิชา / ส่วนงาน</span>
          </Button>
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <LiyonCard>
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ภาควิชา</p>
              <p className="text-lg font-bold">
                {items.filter((i) => (i.type || "DEPARTMENT") === "DEPARTMENT").length}
              </p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">สาขาวิชา</p>
              <p className="text-lg font-bold">
                {items.filter((i) => i.type === "PROGRAM").length}
              </p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ส่วนงาน / ศูนย์</p>
              <p className="text-lg font-bold">
                {items.filter((i) => i.type === "DIVISION").length}
              </p>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">หลักสูตรในสังกัดรวม</p>
              <p className="text-lg font-bold">{totalCurriculums}</p>
            </div>
          </div>
        </LiyonCard>
      </div>

      {/* ── FILTERS ── */}
      <LiyonCard>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 border-b pb-3">
            <span className="text-xs font-semibold text-muted-foreground mr-1">มุมมองประเภท:</span>
            {[
              { key: "ALL", label: "🏛️ ทั้งหมด", count: items.length },
              { key: "DEPARTMENT", label: "🏛️ ภาควิชา (Departments)", count: items.filter((i) => !i.type || i.type === "DEPARTMENT").length },
              { key: "PROGRAM", label: "📚 สาขาวิชา (Programs)", count: items.filter((i) => i.type === "PROGRAM").length },
              { key: "DIVISION", label: "🏢 ส่วนงาน / สำนักงาน", count: items.filter((i) => i.type === "DIVISION").length },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === tab.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 text-[10px] opacity-80 font-mono">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อหน่วยงาน หรือรหัสย่อ..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <LiyonSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs"
            >
              <option value="ALL">🏛️ ทุกประเภทหน่วยงาน ({items.length})</option>
              <option value="DEPARTMENT">ภาควิชา (Department)</option>
              <option value="PROGRAM">สาขาวิชา (Program)</option>
              <option value="DIVISION">ส่วนงาน / สำนักงาน (Division)</option>
            </LiyonSelect>
          </div>
        </div>
      </LiyonCard>

      {/* ── LIST ── */}
      <LiyonCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4">ชื่อภาควิชา / สาขาวิชา / ส่วนงาน</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">รหัสย่อ</th>
                <th className="py-3 px-4 text-center">หลักสูตรในสังกัด</th>
                <th className="py-3 px-4 text-center">บุคลากร</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item, index) => {
                const conf = TYPE_CONFIG[item.type || "DEPARTMENT"] || TYPE_CONFIG.DEPARTMENT;
                const IconComp = conf.icon;
                const currCount = item._count?.curriculums ?? item.curriculums?.length ?? 0;
                const personCount = item._count?.personnel ?? 0;
                const isExpanded = expandedId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors"
                            title={isExpanded ? "ย่อลง" : "ดูหลักสูตรที่สังกัด"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <p className="font-bold text-foreground text-sm flex items-center gap-2">
                              <span>{item.nameTh}</span>
                              {item.type === "PROGRAM" && (() => {
                                const matched = departmentOptions.find((d) =>
                                  item.descriptionTh?.includes(d.nameTh)
                                );
                                if (matched) {
                                  return (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                      <Landmark className="w-2.5 h-2.5" />
                                      <span>สังกัด {matched.nameTh}</span>
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </p>
                            {item.nameEn && (
                              <p className="text-muted-foreground text-[11px] font-sans">
                                {item.nameEn}
                              </p>
                            )}
                            {item.descriptionTh && (
                              <p className="text-muted-foreground text-[11px] line-clamp-1 mt-0.5 max-w-md">
                                {item.descriptionTh}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${conf.color}`}
                        >
                          <IconComp className="w-3 h-3" />
                          <span>{conf.labelTh}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.code ? (
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                            {item.code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(() => {
                          const affiliatedProgs = affiliatedProgramsByDept.get(item.id) || [];
                          const progCount = affiliatedProgs.length;
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleExpand(item.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-xs transition-colors cursor-pointer ${
                                  currCount > 0
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                                title="คลิกเพื่อดูหลักสูตรและสาขาวิชาที่สังกัด"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>{currCount} หลักสูตร</span>
                              </button>
                              {item.type === "DEPARTMENT" && progCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(item.id)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20"
                                  title="คลิกเพื่อดูสาขาวิชาที่สังกัด"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{progCount} สาขาวิชา</span>
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Users className="w-3.5 h-3.5" />
                          <span>{personCount} คน</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className="cursor-pointer inline-flex items-center"
                          title="คลิกเพื่อสลับสถานะเปิด/ปิด"
                        >
                          <StatusPill tone={item.isActive !== false ? "ok" : "off"}>
                            {item.isActive !== false ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </StatusPill>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(item)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="แก้ไขหน่วยงาน"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsDeleting(item)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            title="ลบหน่วยงาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row: Affiliated Programs and Curriculums under this department */}
                    {isExpanded && (
                      <tr className="bg-muted/15 border-b">
                        <td colSpan={8} className="p-4 pl-12">
                          <div className="space-y-4">
                            {/* 1. แสดงสาขาวิชาในสังกัด (Affiliated Programs) ถ้าเป็นภาควิชา */}
                            {item.type === "DEPARTMENT" && (() => {
                              const affiliatedProgs = affiliatedProgramsByDept.get(item.id) || [];
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <BookOpen className="w-4 h-4 text-emerald-600" />
                                      <span>
                                        สาขาวิชาในสังกัด &ldquo;{item.nameTh}&rdquo; ({affiliatedProgs.length}) :
                                      </span>
                                    </p>
                                    <Link
                                      href="/curriculum/departments?type=PROGRAM"
                                      className="text-[11px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
                                    >
                                      <span>จัดการสาขาวิชาทั้งหมด</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>

                                  {affiliatedProgs.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {affiliatedProgs.map((prog) => (
                                        <div
                                          key={prog.id}
                                          className="p-2.5 rounded-lg border bg-background flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-500/30 transition-all"
                                        >
                                          <div className="min-w-0">
                                            <p className="font-semibold text-xs truncate text-foreground flex items-center gap-1">
                                              <span>{prog.nameTh}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                              {prog.nameEn || prog.descriptionTh || "สาขาวิชา"}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <span
                                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                                                prog.isActive !== false
                                                  ? "bg-emerald-500/10 text-emerald-600"
                                                  : "bg-muted text-muted-foreground"
                                              }`}
                                            >
                                              {prog.isActive !== false ? "เปิด" : "ปิด"}
                                            </span>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => openEditDialog(prog)}
                                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                              title="แก้ไขสาขาวิชานี้"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground bg-background/40">
                                      ยังไม่มีสาขาวิชาที่ผูกกับภาควิชานี้ (สามารถไปที่เมนู{" "}
                                      <Link
                                        href="/curriculum/departments?type=PROGRAM"
                                        className="text-emerald-600 underline font-medium"
                                      >
                                        สาขาวิชา
                                      </Link>{" "}
                                      แล้วแก้ไขระบุสังกัดภาควิชาได้)
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* 2. แสดงหลักสูตรในสังกัด (Affiliated Curriculums) */}
                            <div className="space-y-2 border-t pt-2.5">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <span>
                                    หลักสูตรที่สังกัดใน &ldquo;{item.nameTh}&rdquo; ({item.curriculums?.length || 0}) :
                                  </span>
                                </p>
                                <Link
                                  href="/curriculum"
                                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                  <span>จัดการหลักสูตรทั้งหมด</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>

                              {item.curriculums && item.curriculums.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {item.curriculums.map((curr) => (
                                    <Link
                                      key={curr.id}
                                      href="/curriculum"
                                      className="p-2.5 rounded-lg border bg-background hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between gap-2 shadow-2xs group"
                                      title="คลิกเพื่อเปิดหน้าจัดการหลักสูตร"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-semibold text-xs truncate text-foreground group-hover:text-primary transition-colors">
                                          {curr.nameTh}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {curr.degree} • {curr.durationYears} ปี
                                        </p>
                                      </div>
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                                          curr.isActive
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {curr.isActive ? "เปิดสอน" : "ปิด"}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3.5 rounded-lg border border-dashed text-center text-muted-foreground text-xs bg-background/50">
                                  <p>ยังไม่มีหลักสูตรที่ระบุสังกัดในหน่วยงานนี้</p>
                                  <p className="text-[11px] text-muted-foreground/80 mt-1">
                                    ท่านสามารถเข้าไปที่เมนู{" "}
                                    <Link href="/curriculum" className="text-primary underline font-medium">
                                      จัดการหลักสูตร
                                    </Link>{" "}
                                    แล้วเลือก &ldquo;สังกัดภาควิชา&rdquo; เป็น <strong>{item.nameTh}</strong> ได้ทันที
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium">ไม่พบข้อมูลภาควิชาหรือหน่วยงานที่ค้นหา</p>
                    <p className="text-[11px] mt-1">สามารถกด &ldquo;เพิ่มภาควิชา / สาขาวิชา / ส่วนงาน&rdquo; เพื่อสร้างข้อมูลได้ทันที</p>
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
          title={
            editingItem
              ? `แก้ไข${editingItem.type === "PROGRAM" ? "สาขาวิชา" : editingItem.type === "DIVISION" ? "ส่วนงาน" : "ภาควิชา"}`
              : formData.type === "PROGRAM"
              ? "เพิ่มสาขาวิชาใหม่"
              : formData.type === "DIVISION"
              ? "เพิ่มส่วนงานใหม่"
              : "เพิ่มภาควิชา / สาขาวิชา / ส่วนงานใหม่"
          }
          description="กำหนดข้อมูลและโครงสร้างของหน่วยงาน เพื่อจัดเก็บหลักสูตรและบุคลากร"
        />
        <form onSubmit={handleSubmit}>
          <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label="ชื่อหน่วยงาน (ภาษาไทย) *" hint="เช่น ภาควิชาพระพุทธศาสนา หรือ สาขาวิชาปรัชญา">
                <input
                  type="text"
                  required
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  placeholder="ภาควิชาพระพุทธศาสนา"
                />
              </LiyonField>
              <LiyonField label="ชื่อหน่วยงาน (ภาษาอังกฤษ)" hint="เช่น Department of Buddhism">
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Department of Buddhism"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label="ประเภทโครงสร้าง *" hint="ระดับของหน่วยงาน">
                <LiyonSelect
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="DEPARTMENT">🏛️ ภาควิชา (Department)</option>
                  <option value="PROGRAM">📚 สาขาวิชา (Program)</option>
                  <option value="DIVISION">🏢 ส่วนงาน / สำนักงาน (Division)</option>
                </LiyonSelect>
              </LiyonField>

              {formData.type === "PROGRAM" ? (
                <LiyonField
                  label="สังกัดภาควิชา"
                  hint="เลือกภาควิชาที่สาขาวิชานี้สังกัดอยู่"
                >
                  <LiyonSelect
                    value={formData.affiliatedDept}
                    onChange={(e) =>
                      setFormData({ ...formData, affiliatedDept: e.target.value })
                    }
                  >
                    <option value="">-- ไม่ระบุภาควิชา --</option>
                    {departmentOptions.map((d) => (
                      <option key={d.id} value={d.nameTh}>
                        {d.nameTh} {d.code ? `(${d.code})` : ""}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              ) : (
                <LiyonField label="รหัสย่อ (Code)" hint="เช่น BUD, PHI, DEAN">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="BUD"
                    maxLength={50}
                  />
                </LiyonField>
              )}

              <LiyonField label="ลำดับการจัดเรียง (Order Index)">
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) =>
                    setFormData({ ...formData, orderIndex: Number(e.target.value) || 0 })
                  }
                />
              </LiyonField>
            </div>

            {formData.type === "PROGRAM" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LiyonField label="รหัสย่อ (Code)" hint="เช่น PROG_BUD, PROG_PHI">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PROG_BUD"
                    maxLength={50}
                  />
                </LiyonField>
                <div className="flex items-center text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border mt-1">
                  💡 <strong>คำแนะนำ:</strong> เมื่อเลือก <strong>สังกัดภาควิชา</strong> ข้อมูลจะถูกจัดกลุ่มและแสดงความเชื่อมโยงกับภาควิชานั้นๆ โดยอัตโนมัติ
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label="คำอธิบาย / พันธกิจ (ภาษาไทย)">
                <textarea
                  rows={3}
                  value={formData.descriptionTh}
                  onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                  placeholder="รายละเอียด พันธกิจ หรือข้อมูลการติดต่อของหน่วยงาน..."
                />
              </LiyonField>
              <LiyonField label="คำอธิบาย / พันธกิจ (ภาษาอังกฤษ)">
                <textarea
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Department vision, mission, and contact information..."
                />
              </LiyonField>
            </div>

            <div className="pt-2 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <LiyonSwitch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <div>
                  <span className="text-xs font-semibold text-foreground">เปิดใช้งานหน่วยงานนี้</span>
                  <p className="text-[11px] text-muted-foreground">
                    หากปิดใช้งาน หน่วยงานนี้จะไม่แสดงให้เลือกในรายการสร้าง/แก้ไขหลักสูตร
                  </p>
                </div>
              </label>
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
              {submitting ? "กำลังบันทึก..." : editingItem ? "บันทึกการแก้ไข" : "บันทึกหน่วยงาน"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <LiyonDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)} danger>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="ยืนยันการลบหน่วยงาน"
          description="หลักสูตรและบุคลากรที่เคยสังกัดจะถูกเปลี่ยนสถานะเป็น ไม่ระบุภาควิชา"
        />
        <LiyonDialogBody>
          <p className="text-sm text-foreground">
            คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงาน{" "}
            <span className="font-bold text-destructive">&ldquo;{isDeleting?.nameTh}&rdquo;</span>?
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ <strong>หมายเหตุ:</strong> ข้อมูลหลักสูตรจะไม่ถูกลบออกจากระบบ แต่จะถูกปลดออกจากหน่วยงานนี้
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
