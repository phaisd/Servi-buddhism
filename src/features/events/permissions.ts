import type { PermissionDef } from "@/shared/lib/permission-def";

export const EVENTS_P = {
  manage: "events:manage",
} as const;

export const EVENTS_PERMISSIONS: readonly PermissionDef[] = [
  { code: EVENTS_P.manage, module: "events", action: "manage", description: "จัดการกิจกรรมและรายชื่อ" },
];
