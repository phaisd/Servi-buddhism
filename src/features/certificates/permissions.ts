import type { PermissionDef } from "@/shared/lib/permission-def";

export const CERTIFICATES_P = {
  requestView: "certificates:request:view",
  requestManage: "certificates:request:manage",
  typeManage: "certificates:type:manage",
} as const;

export const CERTIFICATES_PERMISSIONS: readonly PermissionDef[] = [
  { code: CERTIFICATES_P.requestView, module: "certificates", action: "request:view", description: "ดูรายการคำร้องขอเอกสาร" },
  { code: CERTIFICATES_P.requestManage, module: "certificates", action: "request:manage", description: "พิจารณาอนุมัติ/ปฏิเสธคำร้องขอเอกสาร" },
  { code: CERTIFICATES_P.typeManage, module: "certificates", action: "type:manage", description: "จัดการประเภทหนังสือรับรอง" },
];
