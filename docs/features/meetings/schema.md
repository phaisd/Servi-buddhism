# Data Model & Validations
## Feature: ระบบจองห้องประชุม (Meeting Rooms)

### 1. Prisma Schema
```prisma
enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model MeetingRoom {
  id              String           @id @default(uuid()) @db.Uuid
  tenantId        String           @map("tenant_id") @db.Uuid
  
  name            String           @db.VarChar(255)
  capacity        Int              @default(10)
  equipment       String?          @db.Text
  imageUrl        String?          @map("image_url") @db.VarChar(500)
  isActive        Boolean          @default(true) @map("is_active")
  
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  bookings        MeetingBooking[]

  @@index([tenantId])
  @@map("meeting_rooms")
}

model MeetingBooking {
  id              String           @id @default(uuid()) @db.Uuid
  tenantId        String           @map("tenant_id") @db.Uuid
  roomId          String           @map("room_id") @db.Uuid
  requesterId     String           @map("requester_id") @db.Uuid // ผู้จอง
  
  title           String           @db.VarChar(255) // หัวข้อการประชุม
  startTime       DateTime         @map("start_time") @db.Timestamptz()
  endTime         DateTime         @map("end_time") @db.Timestamptz()
  
  status          BookingStatus    @default(PENDING)
  remark          String?          @db.Text
  
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  room            MeetingRoom      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  requester       User             @relation(fields: [requesterId], references: [id], onDelete: Cascade)

  @@index([tenantId, roomId, status])
  @@index([startTime, endTime])
  @@map("meeting_bookings")
}
```

### 2. Zod Validations (`validations.ts`)
```typescript
import { z } from "zod";

export const meetingRoomSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  capacity: z.number().int().min(1).default(10),
  equipment: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
});

export const meetingBookingSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  title: z.string().min(1, "Required").max(255),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  remark: z.string().optional().nullable(),
}).refine((data) => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});
```
