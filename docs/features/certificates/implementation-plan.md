# Step-by-step Execution Plan
## Feature: ระบบบริการออกหนังสือรับรอง (Certificates)

แผนปฏิบัติการแบ่งเป็นขั้นตอนย่อย พร้อมการตรวจสอบ

### Phase 1: Data Layer & Core Setup
- [ ] 1. เพิ่ม Prisma Models (`CertificateType`, `CertificateRequest`, Enums) ลงใน `prisma/schema.prisma`
- [ ] 2. รันคำสั่ง `npx prisma migrate dev --name add_certificates_feature`
- [ ] 3. สร้างโครงสร้างโฟลเดอร์ฟีเจอร์ `src/features/certificates/` และ `_internal`
- [ ] 4. ลงทะเบียน Permission Code ใน `permissions.ts` ของฟีเจอร์ และอัปเดตไฟล์ Global `src/permissions.ts`
- [ ] 5. สร้างไฟล์ `messages.ts` (TH/EN) และนำไปผูกที่ `src/i18n/index.ts` พร้อมเขียน/รันเทสต์ i18n

### Phase 2: Internal Logic (Services & Validations)
- [ ] 6. สร้าง `validations.ts` สำหรับ Zod schemas
- [ ] 7. สร้าง `services.ts` (CRUD สำหรับ Certificate Types และ Requests พร้อมใส่ `writeAudit`)
- [ ] 8. เขียน Unit Tests สำหรับ Validations และ Services

### Phase 3: Server Actions & Access
- [ ] 9. สร้าง `actions.ts` ที่ตรวจสอบ Permissions อย่างเคร่งครัด
- [ ] 10. สร้าง `server.ts` และ `index.ts` เพื่อเผยแพร่ API/Types ให้ภายนอก (ถ้ามี)

### Phase 4: User Interfaces (Portal & Admin)
- [ ] 11. สร้างหน้า Admin: จัดการ Certificate Types (`/certificates/types`)
- [ ] 12. สร้างหน้า Admin: หน้ารายการและรีวิวคำร้อง (`/certificates`)
- [ ] 13. เพิ่มเมนู Certificates ลงใน `sidebar-nav.ts` (ส่วน Admin)
- [ ] 14. สร้างหน้า Portal: รายการคำร้องส่วนตัว และฟอร์มยื่นคำร้องใหม่ (`/portal/certificates`)
- [ ] 15. เพิ่มเมนูลงใน Portal Sidebar Navigation

### Phase 5: Verification & Quality Assurance
- [ ] 16. เพิ่มข้อมูล Mock เข้าสู่ `prisma/seed.ts`
- [ ] 17. รัน `npm run check` เพื่อยืนยัน Type, Lint, ทดสอบ Unit & Integration และ Dependency Cruiser
