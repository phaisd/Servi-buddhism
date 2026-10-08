# Technical Architecture & Flow
## Feature: ระบบบริหารจัดการ (General Administration)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/administration/
├── _internal/
│   ├── services.ts          # Logic จัดการเอกสาร
│   ├── validations.ts       # Zod schemas
│   └── tests/
├── actions.ts               # Server Actions สำหรับ Client
├── server.ts                # API exports
├── index.ts                 # Types & Permissions
├── permissions.ts           # Permission codes
└── messages.ts              # i18n dictionary
```

### 2. Route Mapping
**ฝั่ง Portal:**
- `src/app/portal/documents/page.tsx` - ศูนย์ดาวน์โหลดเอกสาร (คัดกรอง Internal เฉพาะคนที่ล็อกอิน)

**ฝั่ง Admin:**
- `src/app/(admin)/administration/page.tsx` - จัดการเอกสารบริหารทั่วไป

### 3. Permissions (RBAC)
- `administration:read` - สิทธิ์การเข้าถึงเมนู
- `administration:manage` - เพิ่ม แก้ไข ลบ เอกสาร
