# Technical Architecture & Flow
## Feature: ระบบบริการออกหนังสือรับรอง (Certificates)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
ตามมาตรฐาน Modular Monolith ของ VibeCore:
```text
src/features/certificates/
├── _internal/               # Business Logic, Services, DB Calls, Validations (ไม่เปิดเผย)
│   ├── services.ts          # Logic การจัดการข้อมูล Certificate Types, Requests
│   ├── validations.ts       # Zod schemas สำหรับ Validate Input
│   └── tests/               # Unit Tests สำหรับ Services
├── actions.ts               # Server Actions สำหรับให้ UI เรียกใช้งาน
├── server.ts                # Public APIs/Functions สำหรับ Feature อื่นเรียกใช้ (ถ้ามี)
├── index.ts                 # Export Types, Enums ที่จำเป็น
├── permissions.ts           # รหัสสิทธิ์ (Permission Codes)
└── messages.ts              # คำแปลภาษา i18n
```

### 2. Route Mapping
**ฝั่ง Portal (หน้าบ้าน):**
- `src/app/portal/certificates/page.tsx` - หน้ารายการคำร้องของตนเอง / ปุ่มขอเอกสารใหม่
- `src/app/portal/certificates/request/page.tsx` - หน้าฟอร์มยื่นคำร้อง

**ฝั่ง Admin (หลังบ้าน):**
- `src/app/(admin)/certificates/page.tsx` - หน้ารวมรายการคำร้องจากผู้ใช้ทั้งหมด (ตาราง)
- `src/app/(admin)/certificates/[id]/page.tsx` - หน้าดูรายละเอียดคำร้องและพิจารณาอนุมัติ
- `src/app/(admin)/certificates/types/page.tsx` - หน้าจัดการ Master Data ของประเภทเอกสาร (Certificate Types)

### 3. Data Flow & State Machine
สถานะของคำร้อง (Request Status):
`PENDING` (รอพิจารณา) -> `APPROVED` (อนุมัติแล้ว/รอรับเอกสาร) | `REJECTED` (ปฏิเสธคำร้อง)

### 4. Permissions (RBAC)
ที่จะต้องลงทะเบียนใน `src/permissions.ts`:
- `certificates:request:view` (ดูรายการคำร้องใน Admin)
- `certificates:request:manage` (อนุมัติ/ปฏิเสธคำร้อง)
- `certificates:type:manage` (จัดการประเภทเอกสาร)
