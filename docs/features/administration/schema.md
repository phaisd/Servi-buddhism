# Data Model & Validations
## Feature: ระบบบริหารจัดการ (General Administration)

### 1. Prisma Schema
```prisma
enum DocumentCategory {
  FORM          // แบบฟอร์ม
  MANUAL        // คู่มือปฏิบัติงาน
  POLICY        // ระเบียบ/ประกาศ
  OTHER         // อื่นๆ
}

enum DocumentVisibility {
  PUBLIC        // สาธารณะ
  INTERNAL      // ภายใน (ต้องล็อกอิน)
}

model AdminDocument {
  id              String             @id @default(uuid()) @db.Uuid
  tenantId        String             @map("tenant_id") @db.Uuid
  
  title           String             @db.VarChar(255)
  description     String?            @db.Text
  fileUrl         String             @map("file_url") @db.VarChar(1000)
  
  category        DocumentCategory   @default(FORM)
  visibility      DocumentVisibility @default(PUBLIC)
  isPublished     Boolean            @default(true) @map("is_published")
  
  createdAt       DateTime           @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime           @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, category, visibility])
  @@map("admin_documents")
}
```

### 2. Zod Validations (`validations.ts`)
```typescript
import { z } from "zod";

export const adminDocumentSchema = z.object({
  title: z.string().min(1, "Required").max(255),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url("Must be a valid URL"),
  category: z.enum(["FORM", "MANUAL", "POLICY", "OTHER"]),
  visibility: z.enum(["PUBLIC", "INTERNAL"]),
  isPublished: z.boolean().default(true),
});
```
