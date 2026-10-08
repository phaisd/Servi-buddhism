import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  read: "curriculum:read",
  manage: "curriculum:manage",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  { code: CURRICULUM_P.read, module: "curriculum", action: "read", description: "ดูข้อมูลหลักสูตรในหลังบ้าน" },
  { code: CURRICULUM_P.manage, module: "curriculum", action: "manage", description: "จัดการเพิ่ม แก้ไข ลบข้อมูลหลักสูตร" },
];
