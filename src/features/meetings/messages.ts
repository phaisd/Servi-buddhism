import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "meetings.nav": { th: "จองห้องประชุม", en: "Meeting Rooms" },
  "meetings.title": { th: "จัดการห้องประชุม", en: "Manage Rooms" },
  "meetings.bookings.title": { th: "รายการคำขอจอง", en: "Booking Requests" },
  
  "meetings.status.PENDING": { th: "รออนุมัติ", en: "Pending" },
  "meetings.status.APPROVED": { th: "อนุมัติ", en: "Approved" },
  "meetings.status.REJECTED": { th: "ปฏิเสธ", en: "Rejected" },
  "meetings.status.CANCELLED": { th: "ยกเลิก", en: "Cancelled" },

  "roles.module.meetings": { th: "ระบบจองห้องประชุม", en: "Meeting Rooms" },
  "perm.meetings:book": { th: "จองห้องประชุม", en: "Book meeting rooms" },
  "perm.meetings:manage": { th: "จัดการและอนุมัติ", en: "Manage rooms & approve bookings" },
};
