# Step-by-step Execution Plan
## Feature: ระบบตรวจการเข้าห้องเรียน (Attendance)

### Phase 1: Data Layer & Core Setup
- [ ] 1. เพิ่ม `AttendanceClass`, `AttendanceSession`, `AttendanceRecord` model ใน `schema.prisma`
- [ ] 2. สร้าง migration & generate Prisma Client
- [ ] 3. สร้างระบบโฟลเดอร์ `src/features/attendance/`
- [ ] 4. เพิ่ม Permissions และ i18n

### Phase 2: Internal Logic
- [ ] 5. สร้าง validations พร้อมเทสต์
- [ ] 6. สร้าง services (CRUD สำหรับ Class, Session, Record) ควบคุม Audit Log

### Phase 3: Actions & API
- [ ] 7. สร้าง Server Actions เพื่อรองรับหน้า UI

### Phase 4: User Interfaces
- [ ] 8. สร้างหน้า Admin - `/attendance/classes` และ `/attendance/classes/[id]/sessions`
- [ ] 9. อัปเดต Sidebar Navigation
- [ ] 10. สร้างหน้า Portal - `/portal/attendance`

### Phase 5: Verification
- [ ] 11. อัปเดตไฟล์ seed `prisma/seed.ts`
- [ ] 12. ตรวจสอบคุณภาพด้วย `npm run check`
