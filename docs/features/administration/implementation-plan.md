# Step-by-step Execution Plan
## Feature: ระบบบริหารจัดการ (General Administration)

### Phase 1: Data Layer & Core Setup
- [ ] 1. เพิ่ม `AdminDocument` model ใน `schema.prisma`
- [ ] 2. สร้าง migration & generate Prisma Client
- [ ] 3. สร้างระบบโฟลเดอร์ `src/features/administration/`
- [ ] 4. เพิ่ม Permissions และ i18n

### Phase 2: Internal Logic
- [ ] 5. สร้าง validations พร้อมเทสต์
- [ ] 6. สร้าง services (CRUD) + ควบคุม Audit Log

### Phase 3: Actions & API
- [ ] 7. สร้าง Server Actions เพื่อรองรับหน้า UI

### Phase 4: User Interfaces
- [ ] 8. สร้างหน้า Admin (`/administration`) จัดการเอกสาร
- [ ] 9. อัปเดต Sidebar Navigation
- [ ] 10. สร้างหน้า Portal (`/portal/documents`) แสดงรายการดาวน์โหลด

### Phase 5: Verification
- [ ] 11. อัปเดตไฟล์ seed `prisma/seed.ts`
- [ ] 12. ตรวจสอบคุณภาพด้วย `npm run check`
