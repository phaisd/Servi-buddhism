import type { PermissionDef } from "@/shared/lib/permission-def";

export const ATTENDANCE_P = {
  read: "attendance:read",
  manage: "attendance:manage",
} as const;

export const ATTENDANCE_PERMISSIONS: readonly PermissionDef[] = [
  { code: ATTENDANCE_P.read, module: "attendance", action: "read", description: "ดูสถิติการเข้าเรียน" },
  { code: ATTENDANCE_P.manage, module: "attendance", action: "manage", description: "จัดการวิชา คาบเรียน และเช็คชื่อ" },
];
