import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "attendance.nav": { th: "เช็คชื่อเข้าเรียน", en: "Attendance" },
  "attendance.classes.title": { th: "จัดการรายวิชาที่สอน", en: "My Classes" },
  "attendance.sessions.title": { th: "คาบเรียน", en: "Sessions" },
  
  "attendance.status.PRESENT": { th: "มาเรียน", en: "Present" },
  "attendance.status.ABSENT": { th: "ขาดเรียน", en: "Absent" },
  "attendance.status.LATE": { th: "มาสาย", en: "Late" },
  "attendance.status.EXCUSED": { th: "ลา", en: "Excused" },

  "roles.module.attendance": { th: "ระบบเช็คชื่อ", en: "Attendance" },
  "perm.attendance:read": { th: "ดูสถิติ", en: "View stats" },
  "perm.attendance:manage": { th: "จัดการและเช็คชื่อ", en: "Manage & take attendance" },
};
