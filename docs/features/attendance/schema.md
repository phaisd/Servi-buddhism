# Data Model & Validations
## Feature: ระบบตรวจการเข้าห้องเรียน (Attendance)

### 1. Prisma Schema
```prisma
model AttendanceClass {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  
  courseCode      String   @db.VarChar(50)
  courseName      String   @db.VarChar(255)
  term            String   @db.VarChar(50) // เช่น "1/2569"
  instructorId    String   @map("instructor_id") @db.Uuid
  isActive        Boolean  @default(true) @map("is_active")
  
  sessions        AttendanceSession[]
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  instructor      User     @relation(fields: [instructorId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("attendance_classes")
}

model AttendanceSession {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  classId         String   @map("class_id") @db.Uuid
  
  date            DateTime @db.Timestamptz()
  topic           String?  @db.VarChar(255)
  
  records         AttendanceRecord[]
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  classObj        AttendanceClass @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@index([tenantId, classId])
  @@map("attendance_sessions")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

model AttendanceRecord {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  sessionId       String   @map("session_id") @db.Uuid
  
  studentCode     String   @map("student_code") @db.VarChar(50)
  studentName     String   @map("student_name") @db.VarChar(255)
  status          AttendanceStatus @default(PRESENT)
  note            String?  @db.Text
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  session         AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, studentCode])
  @@index([tenantId, sessionId])
  @@map("attendance_records")
}
```

### 2. Zod Validations (`validations.ts`)
```typescript
import { z } from "zod";

export const attendanceClassSchema = z.object({
  courseCode: z.string().min(1, "Required").max(50),
  courseName: z.string().min(1, "Required").max(255),
  term: z.string().min(1, "Required").max(50),
  isActive: z.boolean().default(true),
});

export const attendanceSessionSchema = z.object({
  classId: z.string().uuid(),
  date: z.coerce.date(),
  topic: z.string().optional().nullable(),
});

export const attendanceRecordSchema = z.object({
  sessionId: z.string().uuid(),
  studentCode: z.string().min(1),
  studentName: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  note: z.string().optional().nullable(),
});
```
