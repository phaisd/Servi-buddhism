# AI Coding Instructions & Rules (Agent)
## Feature: ระบบจัดการหลักสูตร (Curriculum)

### 1. ขอบเขตโมดูล (Module Boundaries)
- โค้ดทั้งหมดต้องอยู่ภายใต้ `src/features/curriculum/`
- ห้ามเรียกใช้ Logic ข้ามไปยังโมดูลอื่นโดยไม่ผ่าน `server.ts` ของโมดูลนั้น

### 2. มาตรฐานการพัฒนา (Standards)
- ฝั่ง Admin ใช้ Components จาก `@/shared/components/liyon`
- การแก้ไข/ลบข้อมูลต้องเรียกใช้ `writeAudit` เพื่อเก็บบันทึกประวัติ
- ตัวแปรภาษา (i18n) ต้องถูกนิยามใน `messages.ts` และใช้ผ่าน `t("key")`
