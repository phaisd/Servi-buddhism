# AI Coding Instructions & Rules (Agent)
## Feature: ระบบบริหารจัดการ (General Administration)

### 1. ขอบเขตโมดูล (Module Boundaries)
- โค้ดสำหรับฟีเจอร์นี้ให้เก็บไว้ในโฟลเดอร์ `src/features/administration/`
- ข้อมูลที่จัดเก็บจะเป็น URL ของไฟล์ (อาจเป็นลิงก์ Google Drive หรือ S3) โดยไม่ต้องทำระบบ File Upload ลงเซิร์ฟเวอร์โดยตรง

### 2. มาตรฐานการพัฒนา (Standards)
- ใช้งาน Prisma Component: `@/shared/components/liyon`
- บังคับใช้ `useT()` หรือ i18n
- การเปลี่ยนสถานะไฟล์ หรือการอัปเดตจะต้องเรียกใช้ `writeAudit` ทุกครั้ง
