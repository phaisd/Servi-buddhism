import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsCreate: "news:create",
  newsUpdate: "news:update",
  newsReview: "news:review",
  newsPublish: "news:publish",
  newsDelete: "news:delete",
  newsManage: "news:manage",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "อ่านข่าวสารประชาสัมพันธ์" },
  { code: NEWS_P.newsCreate, module: "news", action: "create", description: "สร้างร่างข่าวสารใหม่" },
  { code: NEWS_P.newsUpdate, module: "news", action: "update", description: "แก้ไขเนื้อหาข่าวสาร" },
  { code: NEWS_P.newsReview, module: "news", action: "review", description: "ตรวจทานและส่งคืนแก้ไข" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "อนุมัติเผยแพร่และปักหมุด" },
  { code: NEWS_P.newsDelete, module: "news", action: "delete", description: "ลบข่าวสารและเอกสารแนบ" },
  { code: NEWS_P.newsManage, module: "news", action: "manage", description: "จัดการระบบข่าวสารทั้งหมด" },
];
