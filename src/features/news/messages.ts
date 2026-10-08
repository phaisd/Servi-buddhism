import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & Header
  "news.nav": { th: "ข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.title": { th: "ระบบจัดการข่าวสารประชาสัมพันธ์", en: "News Management" },
  "news.subtitle": { th: "จัดการข่าวสาร ประกาศคณะ และเนื้อหากิจกรรมสำหรับเว็บไซต์คณะพุทธศาสตร์", en: "Manage faculty news, announcements, and event highlights" },
  
  // Actions
  "news.create": { th: "เขียนข่าวใหม่", en: "Create News" },
  "news.edit": { th: "แก้ไขข่าว", en: "Edit News" },
  "news.delete": { th: "ลบข่าว", en: "Delete News" },
  "news.deleteConfirm": { th: "คุณต้องการลบข่าวนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้", en: "Are you sure you want to delete this article? This action cannot be undone." },
  "news.publish": { th: "เผยแพร่", en: "Publish" },
  "news.unpublish": { th: "ยกเลิกการเผยแพร่", en: "Unpublish" },
  "news.submitReview": { th: "ส่งขออนุมัติ", en: "Submit for Review" },
  "news.reject": { th: "ส่งคืนแก้ไข", en: "Reject" },
  "news.pin": { th: "ปักหมุด", en: "Pin" },
  "news.unpin": { th: "ถอนหมุด", en: "Unpin" },
  "news.saveDraft": { th: "บันทึกฉบับร่าง", en: "Save Draft" },
  "news.save": { th: "บันทึกข้อมูล", en: "Save" },
  "news.cancel": { th: "ยกเลิก", en: "Cancel" },
  "news.view": { th: "ดูหน้าเว็บ", en: "View Article" },
  "news.back": { th: "กลับหน้ารายการ", en: "Back to List" },

  // Fields
  "news.titleTh": { th: "หัวข้อข่าว (ภาษาไทย)", en: "Title (Thai)" },
  "news.titleEn": { th: "หัวข้อข่าว (ภาษาอังกฤษ)", en: "Title (English)" },
  "news.slug": { th: "URL Slug", en: "URL Slug" },
  "news.category": { th: "หมวดหมู่", en: "Category" },
  "news.status": { th: "สถานะ", en: "Status" },
  "news.summaryTh": { th: "บทคัดย่อ/คำโปรย (ภาษาไทย)", en: "Summary (Thai)" },
  "news.summaryEn": { th: "บทคัดย่อ/คำโปรย (ภาษาอังกฤษ)", en: "Summary (English)" },
  "news.contentTh": { th: "เนื้อหาข่าว (ภาษาไทย)", en: "Content (Thai)" },
  "news.contentEn": { th: "เนื้อหาข่าว (ภาษาอังกฤษ)", en: "Content (English)" },
  "news.coverImageUrl": { th: "ลิงก์รูปหน้าปก", en: "Cover Image URL" },
  "news.isPinned": { th: "ปักหมุดข่าวเด่น", en: "Featured / Pinned" },
  "news.publishedAt": { th: "วันที่เผยแพร่", en: "Published Date" },
  "news.author": { th: "ผู้เขียน", en: "Author" },
  "news.views": { th: "ยอดเข้าชม", en: "Views" },
  "news.attachments": { th: "เอกสารแนบ", en: "Attachments" },
  "news.rejectionReason": { th: "เหตุผลที่ส่งคืนแก้ไข", en: "Rejection Reason" },

  // Categories
  "news.cat.ALL": { th: "ทั้งหมด", en: "All" },
  "news.cat.ACADEMIC": { th: "ข่าววิชาการ", en: "Academic" },
  "news.cat.EVENT": { th: "ข่าวกิจกรรม", en: "Events" },
  "news.cat.GENERAL": { th: "ข่าวทั่วไป", en: "General" },
  "news.cat.PROCUREMENT": { th: "จัดซื้อจัดจ้าง", en: "Procurement" },
  "news.cat.BUDDHIST_AFFAIRS": { th: "กิจการพระพุทธศาสนา", en: "Buddhist Affairs" },

  // Statuses
  "news.status.ALL": { th: "ทุกสถานะ", en: "All Statuses" },
  "news.status.DRAFT": { th: "ฉบับร่าง", en: "Draft" },
  "news.status.PENDING_REVIEW": { th: "รออนุมัติ", en: "Pending Review" },
  "news.status.PUBLISHED": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.status.ARCHIVED": { th: "จัดเก็บ/ปิดเผยแพร่", en: "Archived" },

  // Notifications & State feedback
  "news.empty": { th: "ไม่พบข่าวสารในระบบ", en: "No news articles found" },
  "news.createSuccess": { th: "สร้างบทความข่าวเรียบร้อยแล้ว", en: "News article created successfully" },
  "news.updateSuccess": { th: "บันทึกการแก้ไขเรียบร้อยแล้ว", en: "News article updated successfully" },
  "news.deleteSuccess": { th: "ลบข่าวสารเรียบร้อยแล้ว", en: "News article deleted successfully" },
  "news.publishSuccess": { th: "เผยแพร่ข่าวสารเรียบร้อยแล้ว", en: "News article published successfully" },
  "news.unpublishSuccess": { th: "ยกเลิกการเผยแพร่เรียบร้อยแล้ว", en: "News article unpublished successfully" },
  "news.pinSuccess": { th: "ปรับสถานะปักหมุดเรียบร้อยแล้ว", en: "Pin status updated" },
  "news.searchPlaceholder": { th: "ค้นหาตามชื่อข่าวหรือเนื้อหา...", en: "Search news by title or content..." },

  // Permissions & Modules (Required by i18n test)
  "roles.module.news": { th: "ระบบข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "perm.news:read": { th: "อ่านข่าวสารประชาสัมพันธ์", en: "Read news articles" },
  "perm.news:create": { th: "สร้างร่างข่าวสารใหม่", en: "Create news drafts" },
  "perm.news:update": { th: "แก้ไขเนื้อหาข่าวสาร", en: "Update news articles" },
  "perm.news:review": { th: "ตรวจทานและส่งคืนแก้ไข", en: "Review and reject news" },
  "perm.news:publish": { th: "อนุมัติเผยแพร่และปักหมุด", en: "Publish and pin news" },
  "perm.news:delete": { th: "ลบข่าวสารและเอกสารแนบ", en: "Delete news articles" },
  "perm.news:manage": { th: "จัดการระบบข่าวสารทั้งหมด", en: "Manage all news features" },
};
