# Technical Architecture & Flow
## Feature: ระบบตรวจการเข้าห้องเรียน (Attendance)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/attendance/
├── _internal/
│   ├── services.ts          # Logic จัดการ Classes, Sessions, Records
│   ├── validations.ts       # Zod schemas
│   └── tests/
├── actions.ts               # Server Actions
├── server.ts                # API exports
├── index.ts                 # Types & Permissions
├── permissions.ts           # Permission codes
└── messages.ts              # i18n dictionary
```

### 2. Route Mapping
**ฝั่ง Portal:**
- `src/app/portal/attendance/page.tsx` - ดูรายวิชาทั้งหมด

**ฝั่ง Admin:**
- `src/app/(admin)/attendance/classes/page.tsx` - จัดการวิชาที่สอน
- `src/app/(admin)/attendance/classes/[classId]/sessions/page.tsx` - จัดการคาบเรียน และเช็คชื่อ

### 3. Permissions (RBAC)
- `attendance:read` - เข้าถึงเพื่อดูสถิติ
- `attendance:manage` - เพิ่ม แก้ไข ลบ วิชา คาบเรียน และบันทึกเวลาเรียน
