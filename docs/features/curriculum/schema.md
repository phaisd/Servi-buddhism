# Data Model & Validations
## Feature: ระบบจัดการหลักสูตร (Curriculum)

### 1. Prisma Schema
```prisma
enum DegreeLevel {
  BACHELOR
  MASTER
  DOCTORATE
  CERTIFICATE
}

model Curriculum {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  
  nameTh          String        @map("name_th") @db.VarChar(255)
  nameEn          String?       @map("name_en") @db.VarChar(255)
  
  degree          DegreeLevel   @default(BACHELOR)
  durationYears   Int           @default(4) @map("duration_years")
  
  descriptionTh   String?       @map("description_th") @db.Text
  descriptionEn   String?       @map("description_en") @db.Text
  imageUrl        String?       @map("image_url") @db.VarChar(500)
  
  isActive        Boolean       @default(true) @map("is_active")
  orderIndex      Int           @default(0) @map("order_index")
  
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime      @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, degree])
  @@map("curriculums")
}
```

### 2. Zod Validations (`validations.ts`)
```typescript
import { z } from "zod";

export const curriculumSchema = z.object({
  nameTh: z.string().min(1, "Required"),
  nameEn: z.string().optional().nullable(),
  degree: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE"]),
  durationYears: z.number().int().min(1).max(10).default(4),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});
```
