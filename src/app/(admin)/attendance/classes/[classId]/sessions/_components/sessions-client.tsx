"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Plus,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Trash2,
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
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createSessionAction,
  deleteSessionAction,
  batchSaveRecordsAction,
} from "@/features/attendance/actions";
import { parseClassStudents } from "@/features/attendance";
import type { AttendanceSession, AttendanceRecord, AttendanceClass } from "@/generated/prisma";

type SessionWithRecords = AttendanceSession & {
  records?: AttendanceRecord[];
  _count?: { records: number };
};

interface SessionsClientProps {
  initialItems: SessionWithRecords[];
  classItem: AttendanceClass & {
    sessions?: Array<{
      id: string;
      topic: string | null;
      date: Date;
    }>;
  };
  classId: string;
}

type AttendanceStatusType = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export function SessionsClient({
  initialItems,
  classItem,
  classId,
}: SessionsClientProps) {
  const [sessions, setSessions] = React.useState<SessionWithRecords[]>(initialItems);

  // Parse Student Roster from Class
  const rosterSession = classItem.sessions?.find((s) => s.topic?.includes("<!-- STUDENTS:"));
  const students = React.useMemo(() => {
    return rosterSession ? parseClassStudents(rosterSession.topic) : [];
  }, [rosterSession]);

  // Exclude the technical roster-holder session from visible teaching sessions
  const visibleSessions = React.useMemo(() => {
    return sessions.filter((s) => !s.topic?.includes("<!-- STUDENTS:"));
  }, [sessions]);

  // Dialog State: Create New Session
  const [isNewSessionOpen, setIsNewSessionOpen] = React.useState(false);
  const [newSessionDate, setNewSessionDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [newSessionTopic, setNewSessionTopic] = React.useState("");
  const [creatingSession, setCreatingSession] = React.useState(false);

  // Dialog State: Take / Check Attendance
  const [activeSession, setActiveSession] = React.useState<SessionWithRecords | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = React.useState(false);
  const [attendanceMap, setAttendanceMap] = React.useState<
    Record<string, { status: AttendanceStatusType; note: string }>
  >({});
  const [savingAttendance, setSavingAttendance] = React.useState(false);

  // Open Create Session
  const handleOpenCreateSession = () => {
    setNewSessionDate(new Date().toISOString().split("T")[0]);
    setNewSessionTopic(`ครั้งที่ ${visibleSessions.length + 1} - บรรยายเนื้อหา`);
    setIsNewSessionOpen(true);
  };

  // Create Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionDate) {
      toast.error("กรุณาระบุวันที่สอน");
      return;
    }

    setCreatingSession(true);
    try {
      const created = await createSessionAction({
        classId,
        date: new Date(newSessionDate),
        topic: newSessionTopic.trim() || undefined,
      });

      setSessions([
        {
          ...(created as AttendanceSession),
          records: [],
          _count: { records: 0 },
        },
        ...sessions,
      ]);
      toast.success("สร้างคาบเรียนใหม่เรียบร้อยแล้ว");
      setIsNewSessionOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการสร้างคาบเรียน");
    } finally {
      setCreatingSession(false);
    }
  };

  // Delete Session
  const handleDeleteSession = async (s: SessionWithRecords) => {
    if (!confirm(`คุณต้องการลบคาบเรียนวันที่ ${new Intl.DateTimeFormat("th-TH").format(new Date(s.date))} ใช่หรือไม่?`)) return;
    try {
      await deleteSessionAction(classId, s.id);
      setSessions((prev) => prev.filter((it) => it.id !== s.id));
      toast.success("ลบคาบเรียนเรียบร้อยแล้ว");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบคาบเรียน");
    }
  };

  // Open Take Attendance Modal
  const handleOpenTakeAttendance = (s: SessionWithRecords) => {
    setActiveSession(s);

    // Initialize statuses from existing records or default to PRESENT
    const map: Record<string, { status: AttendanceStatusType; note: string }> = {};
    const existingRecords = s.records || [];

    students.forEach((st) => {
      const rec = existingRecords.find((r) => r.studentCode === st.studentCode);
      if (rec) {
        map[st.studentCode] = {
          status: rec.status as AttendanceStatusType,
          note: rec.note || "",
        };
      } else {
        map[st.studentCode] = {
          status: "PRESENT",
          note: "",
        };
      }
    });

    setAttendanceMap(map);
    setIsAttendanceModalOpen(true);
  };

  // Mark all students with a status
  const handleMarkAll = (status: AttendanceStatusType) => {
    const updated = { ...attendanceMap };
    students.forEach((st) => {
      if (updated[st.studentCode]) {
        updated[st.studentCode].status = status;
      }
    });
    setAttendanceMap(updated);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (!activeSession) return;
    setSavingAttendance(true);
    try {
      const recordsToSave = students.map((st) => {
        const item = attendanceMap[st.studentCode] || { status: "PRESENT", note: "" };
        return {
          studentCode: st.studentCode,
          studentName: st.studentName,
          status: item.status,
          note: item.note || null,
        };
      });

      await batchSaveRecordsAction({
        sessionId: activeSession.id,
        records: recordsToSave,
      });

      // Update local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                records: recordsToSave as unknown as AttendanceRecord[],
                _count: { records: recordsToSave.length },
              }
            : s
        )
      );

      toast.success("บันทึกการตรวจเช็คการเข้าเรียนเรียบร้อยแล้ว");
      setIsAttendanceModalOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกการเช็คชื่อ");
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/attendance/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้ารายวิชาทั้งหมด</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {classItem.courseCode}
            </span>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
              ภาคเรียน {classItem.term}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            {classItem.courseName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <span>นิสิตในรายวิชา: <strong>{students.length}</strong> รูป/คน</span>
            <span>•</span>
            <span>เช็คชื่อแล้ว: <strong>{visibleSessions.length}</strong> คาบ</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenCreateSession}
            className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มคาบเรียนและเช็คชื่อ</span>
          </Button>

          <Link
            href="/attendance/classes"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors h-9"
          >
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>จัดการรายชื่อนิสิต</span>
          </Link>
        </div>
      </div>

      {/* ── SESSIONS LIST ── */}
      <LiyonCard className="overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>บันทึกการเช็คชื่อแต่ละคาบเรียน ({visibleSessions.length} คาบ)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4 w-16 text-center">ครั้งที่</th>
                <th className="py-3 px-4 w-36">วันที่สอน</th>
                <th className="py-3 px-4">หัวข้อ / กิจกรรมการเรียน</th>
                <th className="py-3 px-4 w-48 text-center">สรุปผลการเข้าเรียน</th>
                <th className="py-3 px-4 w-40 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleSessions.map((session, idx) => {
                const recs = session.records || [];
                const presentCount = recs.filter((r) => r.status === "PRESENT").length;
                const absentCount = recs.filter((r) => r.status === "ABSENT").length;
                const lateCount = recs.filter((r) => r.status === "LATE").length;
                const excusedCount = recs.filter((r) => r.status === "EXCUSED").length;
                const hasRecords = recs.length > 0;

                return (
                  <tr key={session.id} className="hover:bg-muted/15 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                      #{visibleSessions.length - idx}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "medium",
                      }).format(new Date(session.date))}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {session.topic || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasRecords ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            มา {presentCount}
                          </span>
                          {lateCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              สาย {lateCount}
                            </span>
                          )}
                          {excusedCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                              ลา {excusedCount}
                            </span>
                          )}
                          {absentCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-700 dark:text-red-300">
                              ขาด {absentCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          ยังไม่ได้บันทึก
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleOpenTakeAttendance(session)}
                          className="h-7.5 px-3 text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer shadow-2xs"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          <span>{hasRecords ? "แก้ไขเช็คชื่อ" : "เช็คชื่อ"}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSession(session)}
                          className="h-7.5 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="ลบคาบเรียนนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleSessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    ยังไม่มีบันทึกคาบเรียนในวิชานี้ กดปุ่ม &quot;+ เพิ่มคาบเรียนและเช็คชื่อ&quot; ด้านบนเพื่อเริ่มต้น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </LiyonCard>

      {/* ── CREATE NEW SESSION DIALOG ── */}
      <LiyonDialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="เพิ่มคาบเรียนใหม่"
          description={`กำหนดวันที่และหัวข้อการสอนสำหรับรายวิชา ${classItem.courseName}`}
        />
        <form onSubmit={handleCreateSession}>
          <LiyonDialogBody className="space-y-4">
            <LiyonField label="วันที่สอน *">
              <input
                type="date"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                required
              />
            </LiyonField>

            <LiyonField label="หัวข้อการสอน / กิจกรรม" hint="เช่น บทที่ 1 ความรู้เบื้องต้นเกี่ยวกับกฎหมาย">
              <input
                type="text"
                value={newSessionTopic}
                onChange={(e) => setNewSessionTopic(e.target.value)}
                placeholder="ระบุหัวข้อหรือกิจกรรม..."
              />
            </LiyonField>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewSessionOpen(false)}
              disabled={creatingSession}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={creatingSession}>
              <span>{creatingSession ? "กำลังสร้าง..." : "สร้างคาบเรียน"}</span>
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* ── TAKE ATTENDANCE MODAL ── */}
      <LiyonDialog
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        wide
        className="!max-w-4xl w-[96vw]"
      >
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={`เช็คชื่อเข้าเรียน: ${classItem.courseName} (${classItem.courseCode})`}
          description={
            activeSession
              ? `วันที่ ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(activeSession.date))} - ${activeSession.topic || "บรรยาย"}`
              : ""
          }
        />

        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Quick batch selectors */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-muted/20">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>ทำเครื่องหมายทั้งหมด:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("PRESENT")}
                className="h-7 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>มาเรียนทั้งหมด</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("LATE")}
                className="h-7 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                <span>สายทั้งหมด</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("EXCUSED")}
                className="h-7 text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                <span>ลาทั้งหมด</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMarkAll("ABSENT")}
                className="h-7 text-xs bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 hover:bg-red-500/20"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                <span>ขาดทั้งหมด</span>
              </Button>
            </div>
          </div>

          {/* Student Roster Table for Attendance */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-muted/70 border-b border-border text-muted-foreground font-semibold sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                  <th className="py-2.5 px-3 w-28">รหัสนิสิต</th>
                  <th className="py-2.5 px-3">ชื่อ-ฉายา / นามสกุล</th>
                  <th className="py-2.5 px-3 w-24 text-center">ชั้นปี/สาขา</th>
                  <th className="py-2.5 px-3 w-72 text-center">สถานะการเข้าเรียน</th>
                  <th className="py-2.5 px-3">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((st, idx) => {
                  const curr = attendanceMap[st.studentCode] || { status: "PRESENT", note: "" };

                  return (
                    <tr key={st.studentCode} className="hover:bg-muted/15 transition-colors">
                      <td className="py-2.5 px-3 text-center text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">
                        {st.studentCode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {st.studentName}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-muted-foreground">
                        {st.yearLevel ? `ปี ${st.yearLevel}` : "-"}
                        {st.major ? ` (${st.major})` : ""}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceMap({
                                ...attendanceMap,
                                [st.studentCode]: { ...curr, status: "PRESENT" },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              curr.status === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-2xs scale-105"
                                : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                            }`}
                          >
                            มา
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceMap({
                                ...attendanceMap,
                                [st.studentCode]: { ...curr, status: "LATE" },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              curr.status === "LATE"
                                ? "bg-amber-600 text-white shadow-2xs scale-105"
                                : "bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                            }`}
                          >
                            สาย
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceMap({
                                ...attendanceMap,
                                [st.studentCode]: { ...curr, status: "EXCUSED" },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              curr.status === "EXCUSED"
                                ? "bg-blue-600 text-white shadow-2xs scale-105"
                                : "bg-muted text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600"
                            }`}
                          >
                            ลา
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceMap({
                                ...attendanceMap,
                                [st.studentCode]: { ...curr, status: "ABSENT" },
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              curr.status === "ABSENT"
                                ? "bg-red-600 text-white shadow-2xs scale-105"
                                : "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                            }`}
                          >
                            ขาด
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={curr.note}
                          onChange={(e) =>
                            setAttendanceMap({
                              ...attendanceMap,
                              [st.studentCode]: { ...curr, note: e.target.value },
                            })
                          }
                          placeholder="หมายเหตุ (ถ้ามี)..."
                          className="w-full text-xs px-2 py-1 rounded border border-border bg-background"
                        />
                      </td>
                    </tr>
                  );
                })}

                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      ยังไม่มีรายชื่อนิสิตในรายวิชานี้ กรุณาเพิ่มรายชื่อนิสิตในหน้า &quot;จัดการรายวิชา&quot; ก่อนเริ่มเช็คชื่อ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAttendanceModalOpen(false)}
            disabled={savingAttendance}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSaveAttendance}
            disabled={savingAttendance || students.length === 0}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savingAttendance ? "กำลังบันทึก..." : "บันทึกผลการเข้าเรียน"}</span>
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
