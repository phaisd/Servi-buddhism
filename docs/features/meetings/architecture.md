# Technical Architecture & Flow
## Feature: ระบบจองห้องประชุม (Meeting Rooms)

### 1. โครงสร้างโฟลเดอร์ (Folder Structure)
```text
src/features/meetings/
├── _internal/
│   ├── services.ts          # Logic จัดการห้อง และระบบตรวจสอบการจองซ้อน
│   ├── validations.ts       # Zod schemas (ตรวจ startTime < endTime)
│   └── tests/
├── actions.ts               # Server Actions
├── server.ts                # API exports (ให้ Portal นำไปใช้แสดงผลปฏิทิน)
├── index.ts                 # Types & Permissions
├── permissions.ts           # Permission codes (book, manage)
└── messages.ts              # i18n dictionary
```

### 2. Route Mapping
**ฝั่ง Portal (ต้องล็อกอินเพื่อจอง):**
- `src/app/portal/meetings/page.tsx` - รายการห้องประชุมและปฏิทินแสดงการจอง
- `src/app/portal/meetings/book/page.tsx` - ฟอร์มส่งคำขอจอง

**ฝั่ง Admin:**
- `src/app/(admin)/meetings/rooms/page.tsx` - จัดการข้อมูลห้องประชุม (Admin)
- `src/app/(admin)/meetings/bookings/page.tsx` - รายการคำขอจอง รอการอนุมัติ (Admin)

### 3. Permissions (RBAC)
- `meetings:book` - สิทธิ์ในการส่งคำขอจองห้อง (Staff/User)
- `meetings:manage` - สิทธิ์จัดการห้องและอนุมัติการจอง (Admin)
