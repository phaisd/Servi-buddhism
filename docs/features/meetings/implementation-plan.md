# Step-by-step Execution Plan
## Feature: ระบบจองห้องประชุม (Meeting Rooms)

### Phase 1: Data Layer & Core Setup
- [ ] 1. เพิ่ม `MeetingRoom` และ `MeetingBooking` model ใน `schema.prisma`
- [ ] 2. สร้าง migration & generate Prisma Client
- [ ] 3. สร้างระบบโฟลเดอร์ `src/features/meetings/`
- [ ] 4. เพิ่ม Permissions และ i18n

### Phase 2: Internal Logic
- [ ] 5. สร้าง validations พร้อม refine เช็คเวลา (start < end)
- [ ] 6. สร้าง services (CRUD) ควบคุม Audit Log และระบบตรวจสอบ Overlap Time

### Phase 3: Actions & API
- [ ] 7. สร้าง Server Actions เพื่อรองรับหน้า UI (จองห้อง, อนุมัติ)

### Phase 4: User Interfaces
- [ ] 8. สร้างหน้า Admin - `/meetings/rooms` และ `/meetings/bookings`
- [ ] 9. อัปเดต Sidebar Navigation
- [ ] 10. สร้างหน้า Portal - `/portal/meetings` และฟอร์มจองห้อง `/portal/meetings/book`

### Phase 5: Verification
- [ ] 11. อัปเดตไฟล์ seed `prisma/seed.ts`
- [ ] 12. ตรวจสอบคุณภาพด้วย `npm run check`
