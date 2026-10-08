import type { PermissionDef } from "@/shared/lib/permission-def";

export const ADMINISTRATION_P = {
  read: "administration:read",
  manage: "administration:manage",
} as const;

export const ADMINISTRATION_PERMISSIONS: readonly PermissionDef[] = [
  { code: ADMINISTRATION_P.read, module: "administration", action: "read", description: "ดูรายการเอกสารบริหารทั่วไปในหลังบ้าน" },
  { code: ADMINISTRATION_P.manage, module: "administration", action: "manage", description: "จัดการเพิ่ม แก้ไข ลบเอกสารแบบฟอร์ม" },
];
