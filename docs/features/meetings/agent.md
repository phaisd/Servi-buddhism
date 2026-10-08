# AI Coding Instructions & Rules (Agent)
## Feature: ระบบจองห้องประชุม (Meeting Rooms)

### 1. ขอบเขตโมดูล (Module Boundaries)
- โค้ดสำหรับฟีเจอร์นี้ให้เก็บไว้ในโฟลเดอร์ `src/features/meetings/`
- ข้อมูล Room และ Booking ต้องเชื่อมโยงกับ Tenant เสมอ

### 2. มาตรฐานการพัฒนา (Standards)
- **Timezone**: การบันทึกเวลาจอง (startTime, endTime) ให้เก็บเป็น UTC Timestamp เสมอ (`@db.Timestamptz()`)
- **Validation**: การตรวจสอบ Overlap ของเวลา ต้องทำที่ระดับ Service (Backend) อย่างเคร่งครัด (ใช้ Prisma query ตรวจสอบช่วงเวลาซ้อนทับ)
- การอนุมัติหรือยกเลิกการจอง จะต้องมี Audit Log บันทึกทุกครั้ง
- ห้ามดึงข้อมูลข้าม Tenant
