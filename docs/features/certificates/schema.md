# Data Model & Validations
## Feature: ระบบบริการออกหนังสือรับรอง (Certificates)

### 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
enum CertificateRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

// ประเภทของหนังสือรับรอง (Master Data)
model CertificateType {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  name        String   // ชื่อเอกสาร เช่น "หนังสือรับรองสภาพนิสิต"
  description String?  // คำอธิบาย
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  requests    CertificateRequest[]

  @@index([tenantId])
}

// รายการคำร้องขอหนังสือรับรอง
model CertificateRequest {
  id                String   @id @default(cuid())
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  certificateTypeId String
  certificateType   CertificateType @relation(fields: [certificateTypeId], references: [id])
  
  status            CertificateRequestStatus @default(PENDING)
  reason            String? // กรณีปฏิเสธ (Reject Reason) หรือ ข้อมูลเพิ่มเติม
  note              String? // หมายเหตุจากผู้ขอ

  // เก็บ URL ไฟล์เอกสารที่เจ้าหน้าที่ออกให้ (ถ้ามี)
  issuedDocumentUrl String? 

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([tenantId])
  @@index([userId])
}
```

### 2. Zod Validations (`src/features/certificates/_internal/validations.ts`)
```typescript
import { z } from "zod";

export const createCertificateRequestSchema = z.object({
  certificateTypeId: z.string().min(1, "Required"),
  note: z.string().optional(),
});

export const reviewCertificateRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
  issuedDocumentUrl: z.string().url().optional().or(z.literal("")),
}).refine(data => {
  if (data.status === "REJECTED" && !data.reason) {
    return false;
  }
  return true;
}, {
  message: "Reason is required when rejected",
  path: ["reason"]
});
```

### 3. Translation Keys (`src/features/certificates/messages.ts`)
```typescript
export const th = {
  module: { title: "บริการออกหนังสือรับรอง", description: "ระบบจัดการคำร้องขอเอกสาร" },
  status: { PENDING: "รอพิจารณา", APPROVED: "อนุมัติแล้ว", REJECTED: "ถูกปฏิเสธ" },
  // ... (อื่นๆ เพิ่มเติม)
};
```
