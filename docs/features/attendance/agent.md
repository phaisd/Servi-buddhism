# AI Coding Instructions & Rules (Agent)
## Feature: ระบบตรวจการเข้าห้องเรียน (Attendance)

### 1. ขอบเขตโมดูล (Module Boundaries)
- โค้ดสำหรับฟีเจอร์นี้ให้เก็บไว้ในโฟลเดอร์ `src/features/attendance/`
- ข้อมูล Class, Session, และ Record ต้องมี `tenantId` ผูกไว้เสมอ

### 2. มาตรฐานการพัฒนา (Standards)
- ใช้งาน Prisma Component: `@/shared/components/liyon`
- บังคับใช้ `useT()` หรือ i18n
- การเปลี่ยนสถานะการเข้าเรียน ต้องเรียก `writeAudit` เพื่อติดตามว่าอาจารย์แก้ไขข้อมูลเมื่อใด
