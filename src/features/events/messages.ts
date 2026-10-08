import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "events.nav": { th: "กิจกรรมนิสิต", en: "Student Events" },
  "events.title": { th: "จัดการกิจกรรม", en: "Manage Events" },
  
  "events.status.REGISTERED": { th: "ลงทะเบียนแล้ว", en: "Registered" },
  "events.status.ATTENDED": { th: "เข้าร่วมแล้ว", en: "Attended" },
  "events.status.CANCELLED": { th: "ยกเลิก", en: "Cancelled" },

  "roles.module.events": { th: "ระบบกิจกรรม", en: "Events" },
  "perm.events:manage": { th: "จัดการกิจกรรมและรายชื่อ", en: "Manage events and registrations" },
};
