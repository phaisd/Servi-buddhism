import type { PermissionDef } from "@/shared/lib/permission-def";

export const MEETINGS_P = {
  book: "meetings:book",
  manage: "meetings:manage",
} as const;

export const MEETINGS_PERMISSIONS: readonly PermissionDef[] = [
  { code: MEETINGS_P.book, module: "meetings", action: "book", description: "สิทธิ์ในการส่งคำขอจองห้อง" },
  { code: MEETINGS_P.manage, module: "meetings", action: "manage", description: "จัดการห้องและอนุมัติการจอง" },
];
