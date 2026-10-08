# Technical Architecture & Flow
## Feature: ระบบจัดการบุคลากร (Personnel)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/personnel/
├── _internal/
│   ├── services.ts          # Logic จัดการบุคลากรและหน่วยงาน
│   ├── validations.ts       # Zod schemas 
│   └── tests/
├── actions.ts               # Server Actions 
├── server.ts                # Public API
├── index.ts                 # Export types & permissions
├── permissions.ts           # Permission Codes
└── messages.ts              # i18n Dictionary
```

### 2. Route Mapping
**ฝั่ง Portal (หน้าบ้าน):**
- `src/app/portal/personnel/page.tsx` - หน้าทำเนียบบุคลากรรวม กรองตามหน่วยงาน

**ฝั่ง Admin (หลังบ้าน):**
- `src/app/(admin)/personnel/page.tsx` - จัดการบุคลากรทั้งหมด
- `src/app/(admin)/personnel/departments/page.tsx` - จัดการโครงสร้างหน่วยงาน

### 3. Permissions (RBAC)
- `personnel:read` - ดูข้อมูลบุคลากรในหลังบ้าน
- `personnel:manage` - จัดการข้อมูลบุคลากรและหน่วยงาน
