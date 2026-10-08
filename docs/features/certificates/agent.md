# AI Coding Instructions & Rules (Agent)
## Feature: ระบบบริการออกหนังสือรับรอง (Certificates)

### 1. กฎเหล็กและข้อห้าม (Hard Rules)
- **ห้าม** ข้ามขอบเขต Module: ทุกอย่างที่เกี่ยวกับ certificates ต้องอยู่ภายใน `src/features/certificates/` เท่านั้น (ยกเว้น Schema ใน `prisma/schema.prisma` และการลงทะเบียนในไฟล์ Global เช่น `permissions.ts`, `messages.ts`)
- **ห้าม** Import file จาก `_internal` ของ features อื่นโดยเด็ดขาด 
- ฟังก์ชันที่เปลี่ยนแปลงสถานะใน Database (Create, Update, Delete) **ต้อง** เรียกใช้ `writeAudit()` จาก `@/features/identity/server` เสมอ
- ทุกลงทะเบียน API Route/Server Actions ที่เกี่ยวกับ Admin ต้องตรวจ Permission อย่างเข้มงวด

### 2. การใช้ Component ของระบบ (UI System)
- ใช้ Components จาก `@/shared/components/liyon` เท่านั้น สำหรับการสร้าง UI
- ใช้ `DataTable` หรือ `Card` สำหรับการแสดงรายการคำร้อง
- ใช้ `Form` ที่เชื่อมกับ `react-hook-form` และ `zodResolver` เสมอ

### 3. Internationalization (i18n)
- **ห้าม** ฮาร์ดโค้ดข้อความ (Hardcode strings) ใน UI
- ข้อความทุกอย่างต้องใช้ `t("key")` จาก `next-intl`
- ต้องประกาศ Translation keys ที่ `src/features/certificates/messages.ts` (ทั้ง TH และ EN) และนำไปผูกที่ `src/i18n/index.ts` เสมอ
