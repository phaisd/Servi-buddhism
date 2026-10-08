# Technical Architecture & Flow
## Feature: ระบบเข้าร่วมกิจกรรม (Events)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/events/
├── _internal/
│   ├── services.ts          
│   ├── validations.ts       
│   └── tests/
├── actions.ts               
├── server.ts                
├── index.ts                 
├── permissions.ts           
└── messages.ts              
```

### 2. Route Mapping
**ฝั่ง Portal:**
- `src/app/portal/events/page.tsx` - ปฏิทิน/รายการกิจกรรม
- `src/app/portal/events/[id]/page.tsx` - รายละเอียดกิจกรรมและปุ่มลงทะเบียน

**ฝั่ง Admin:**
- `src/app/(admin)/events/page.tsx` - รายการกิจกรรม (CRUD)
- `src/app/(admin)/events/[id]/registrations/page.tsx` - รายชื่อนิสิต

### 3. Permissions (RBAC)
- `events:manage` - จัดการกิจกรรมและรายชื่อ
- `events:register` - สิทธิ์การลงทะเบียนสำหรับผู้ใช้งานที่ล็อกอิน
