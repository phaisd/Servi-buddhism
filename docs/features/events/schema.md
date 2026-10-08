# Data Model & Validations
## Feature: ระบบเข้าร่วมกิจกรรม (Events)

### 1. Prisma Schema
```prisma
model Event {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  
  title           String   @db.VarChar(255)
  description     String?  @db.Text
  location        String?  @db.VarChar(255)
  startDate       DateTime @map("start_date") @db.Timestamptz()
  endDate         DateTime @map("end_date") @db.Timestamptz()
  capacity        Int      @default(0) // 0 = unlimited
  isActive        Boolean  @default(true) @map("is_active")
  
  registrations   EventRegistration[]
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("events")
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}

model EventRegistration {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  eventId         String   @map("event_id") @db.Uuid
  
  studentCode     String   @map("student_code") @db.VarChar(50)
  studentName     String   @map("student_name") @db.VarChar(255)
  status          RegistrationStatus @default(REGISTERED)
  
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, studentCode])
  @@index([tenantId, eventId])
  @@map("event_registrations")
}
```

### 2. Zod Validations
```typescript
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Required").max(255),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  studentCode: z.string().min(1).max(50),
  studentName: z.string().min(1).max(255),
});
```
