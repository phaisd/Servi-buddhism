# Data Model & Validations
## Feature: ระบบจัดการบุคลากร (Personnel)

### 1. Prisma Schema
```prisma
enum PersonnelType {
  EXECUTIVE    // สายผู้บริหาร
  ACADEMIC     // สายวิชาการ (อาจารย์)
  SUPPORT      // สายสนับสนุน (เจ้าหน้าที่)
}

model Department {
  id          String      @id @default(uuid()) @db.Uuid
  tenantId    String      @map("tenant_id") @db.Uuid
  
  nameTh      String      @map("name_th") @db.VarChar(255)
  nameEn      String?     @map("name_en") @db.VarChar(255)
  orderIndex  Int         @default(0) @map("order_index")
  
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime    @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  personnel   Personnel[]

  @@index([tenantId])
  @@map("departments")
}

model Personnel {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  departmentId    String?       @map("department_id") @db.Uuid
  
  firstNameTh     String        @map("first_name_th") @db.VarChar(100)
  lastNameTh      String        @map("last_name_th") @db.VarChar(100)
  firstNameEn     String?       @map("first_name_en") @db.VarChar(100)
  lastNameEn      String?       @map("last_name_en") @db.VarChar(100)
  
  positionTh      String        @map("position_th") @db.VarChar(255) // ตำแหน่ง
  positionEn      String?       @map("position_en") @db.VarChar(255)
  
  type            PersonnelType @default(ACADEMIC)
  imageUrl        String?       @map("image_url") @db.VarChar(500)
  email           String?       @db.VarChar(255)
  phoneNumber     String?       @map("phone_number") @db.VarChar(50)
  
  isActive        Boolean       @default(true) @map("is_active")
  orderIndex      Int           @default(0) @map("order_index")
  
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime      @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department      Department?   @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  @@index([tenantId, type])
  @@index([departmentId])
  @@map("personnel")
}
```

### 2. Zod Validations (`validations.ts`)
```typescript
import { z } from "zod";

export const departmentSchema = z.object({
  nameTh: z.string().min(1),
  nameEn: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

export const personnelSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  firstNameTh: z.string().min(1),
  lastNameTh: z.string().min(1),
  firstNameEn: z.string().optional(),
  lastNameEn: z.string().optional(),
  positionTh: z.string().min(1),
  positionEn: z.string().optional(),
  type: z.enum(["EXECUTIVE", "ACADEMIC", "SUPPORT"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});
```
