# AI Coding Instructions & Rules (Agent)
## Feature: ระบบเข้าร่วมกิจกรรมต่าง ๆ ของนิสิต (Events)

### 1. ขอบเขตโมดูล (Module Boundaries)
- โค้ดสำหรับฟีเจอร์นี้ให้เก็บไว้ในโฟลเดอร์ `src/features/events/`
- ทุกตารางจะต้องมี `tenantId`

### 2. มาตรฐานการพัฒนา (Standards)
- ใช้งาน Prisma Component: `@/shared/components/liyon`
- บังคับใช้ `useT()` หรือ i18n
- ต้องบันทึก Audit log เมื่อมีการสร้างหรือเปลี่ยนสถานะ
