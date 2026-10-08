# Technical Architecture & Flow
## Feature: ระบบจัดการหลักสูตร (Curriculum)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/curriculum/
├── _internal/
│   ├── services.ts          # Core logic ควบคุมการจัดการหลักสูตร
│   ├── validations.ts       # Zod schemas สำหรับข้อมูลเข้า
│   └── tests/
├── actions.ts               # Server Actions สำหรับ Client Components
├── server.ts                # API สำหรับ Backend และโมดูลอื่น
├── index.ts                 # Type & Permission Definitions
├── permissions.ts           # การกำหนดสิทธิ์
└── messages.ts              # คลังคำแปล (i18n)
```

### 2. Route Mapping
**ฝั่ง Portal (หน้าบ้าน):**
- `src/app/portal/programs/page.tsx` - หน้ารายการหลักสูตร

**ฝั่ง Admin (หลังบ้าน):**
- `src/app/(admin)/curriculum/page.tsx` - ตารางจัดการหลักสูตรทั้งหมด

### 3. Permissions (RBAC)
- `curriculum:read` - ดูข้อมูลหลักสูตรในฝั่งหลังบ้าน
- `curriculum:manage` - จัดการเพิ่ม แก้ไข ลบข้อมูลหลักสูตร
