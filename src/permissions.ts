import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { CERTIFICATES_PERMISSIONS } from "@/features/certificates/permissions";
import { PERSONNEL_PERMISSIONS } from "@/features/personnel/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { ADMINISTRATION_PERMISSIONS } from "@/features/administration/permissions";
import { MEETINGS_PERMISSIONS } from "@/features/meetings/permissions";
import { ATTENDANCE_PERMISSIONS } from "@/features/attendance/permissions";
import { EVENTS_PERMISSIONS } from "@/features/events/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...CERTIFICATES_PERMISSIONS,
  ...PERSONNEL_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...ADMINISTRATION_PERMISSIONS,
  ...MEETINGS_PERMISSIONS,
  ...ATTENDANCE_PERMISSIONS,
  ...EVENTS_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
