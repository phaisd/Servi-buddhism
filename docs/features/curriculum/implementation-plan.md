# Step-by-step Execution Plan
## Feature: ระบบจัดการหลักสูตร (Curriculum)

### Phase 1: Data Layer & Core Setup
- [ ] 1. เพิ่ม Prisma Models ลงใน `prisma/schema.prisma`
- [ ] 2. รันคำสั่ง migration
- [ ] 3. สร้างโครงสร้างโฟลเดอร์ฟีเจอร์ `src/features/curriculum/`
- [ ] 4. ตั้งค่า Permissions และ i18n Messages

### Phase 2: Internal Logic (Services & Validations)
- [ ] 5. สร้าง `validations.ts` และ Unit Tests
- [ ] 6. สร้าง `services.ts` ควบคุม CRUD พร้อม `writeAudit`

### Phase 3: Server Actions & Access
- [ ] 7. สร้าง `actions.ts` ผูกกับ Services
- [ ] 8. ส่งออกผ่าน `server.ts` และ `index.ts`

### Phase 4: User Interfaces (Portal & Admin)
- [ ] 9. หน้า Admin - จัดการ Curriculum
- [ ] 10. อัปเดต Sidebar Navigation
- [ ] 11. หน้า Portal - รายการหลักสูตร

### Phase 5: Verification & Quality Assurance
- [ ] 12. Seed ข้อมูลใน `prisma/seed.ts`
- [ ] 13. รัน `npm run check`
