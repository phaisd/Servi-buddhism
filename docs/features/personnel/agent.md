# AI Coding Instructions & Rules (Agent)
## Feature: ระบบจัดการบุคลากร (Personnel)

### 1. ขอบเขตโมดูล (Module Boundaries)
- ห้ามเขียนโค้ดที่เกี่ยวกับ Personnel ข้ามไปโฟลเดอร์อื่น ต้องอยู่ใน `src/features/personnel/` เท่านั้น (ยกเว้น Prisma Schema, `permissions.ts`, `i18n/index.ts`)
- ห้ามดึงข้อมูลข้ามโมดูลโดยตรง (Cross-module dependency ต้องทำผ่าน public `server.ts` ของโมดูลนั้นๆ)

### 2. มาตรฐานการพัฒนา (Standards)
- ฝั่ง Admin ใช้ `LiyonCard`, `DataTable` และ Form primitives จาก `@/shared/components/liyon`
- การแก้ไข/ลบข้อมูลต้องใช้ `writeAudit` จาก `@/features/identity/server` เสมอ
- ข้อความทั้งหมดต้องใช้ `t("key")` (i18n) ห้ามฮาร์ดโค้ด
