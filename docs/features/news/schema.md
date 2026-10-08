# Data Model & Validations: News Feature

## 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
enum NewsCategory {
  ACADEMIC
  EVENT
  GENERAL
  PROCUREMENT
  BUDDHIST_AFFAIRS
}

enum NewsStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  ARCHIVED
}

model NewsArticle {
  id              String       @id @default(uuid()) @db.Uuid
  tenantId        String       @map("tenant_id") @db.Uuid
  titleTh         String       @map("title_th") @db.VarChar(255)
  titleEn         String?      @map("title_en") @db.VarChar(255)
  slug            String       @db.VarChar(255)
  summaryTh       String?      @map("summary_th") @db.Text
  summaryEn       String?      @map("summary_en") @db.Text
  contentTh       String       @map("content_th") @db.Text
  contentEn       String?      @map("content_en") @db.Text
  coverImageUrl   String?      @map("cover_image_url") @db.VarChar(500)
  category        NewsCategory @default(GENERAL)
  status          NewsStatus   @default(DRAFT)
  isPinned        Boolean      @default(false) @map("is_pinned")
  pinOrder        Int?         @map("pin_order")
  viewCount       Int          @default(0) @map("view_count")
  publishedAt     DateTime?    @map("published_at") @db.Timestamptz()
  archivedAt      DateTime?    @map("archived_at") @db.Timestamptz()
  rejectionReason String?      @map("rejection_reason") @db.Text
  authorId        String       @map("author_id") @db.Uuid
  reviewerId      String?      @map("reviewer_id") @db.Uuid
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  author      User             @relation("NewsAuthor", fields: [authorId], references: [id], onDelete: Restrict)
  reviewer    User?            @relation("NewsReviewer", fields: [reviewerId], references: [id], onDelete: SetNull)
  attachments NewsAttachment[]

  @@unique([tenantId, slug])
  @@index([tenantId, status, publishedAt])
  @@index([tenantId, category])
  @@map("news_articles")
}

model NewsAttachment {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  articleId  String   @map("article_id") @db.Uuid
  fileName   String   @map("file_name") @db.VarChar(255)
  fileUrl    String   @map("file_url") @db.VarChar(500)
  fileSize   Int      @map("file_size")
  mimeType   String   @map("mime_type") @db.VarChar(100)
  orderIndex Int      @default(0) @map("order_index")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()

  tenant  Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  article NewsArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("news_attachments")
}
```

## 2. Zod Validation Schemas (`src/features/news/_internal/validations.ts`)
```typescript
import { z } from "zod";
import { NewsCategory, NewsStatus } from "@prisma/client";

export const newsArticleSchema = z.object({
  titleTh: z.string().min(1, "validation.required"),
  titleEn: z.string().optional().nullable(),
  summaryTh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
  contentTh: z.string().min(1, "validation.required"),
  contentEn: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  category: z.nativeEnum(NewsCategory),
  isPinned: z.boolean().default(false),
});

export const newsReviewSchema = z.object({
  status: z.enum([NewsStatus.PUBLISHED, NewsStatus.DRAFT]),
  rejectionReason: z.string().optional().nullable(),
});
```

## 3. Translation Keys (`src/i18n/messages/news.ts`)
- `news.title`: "ระบบข่าวสารประชาสัมพันธ์" / "News Management"
- `news.status.DRAFT`: "ร่าง" / "Draft"
- `news.status.PENDING_REVIEW`: "รอตรวจสอบ" / "Pending Review"
- `news.status.PUBLISHED`: "เผยแพร่แล้ว" / "Published"
- `news.status.ARCHIVED`: "จัดเก็บแล้ว" / "Archived"
- `news.category.ACADEMIC`: "วิชาการ" / "Academic"
- `news.category.EVENT`: "กิจกรรม" / "Events"
- `news.category.GENERAL`: "ทั่วไป" / "General"
- `news.category.PROCUREMENT`: "จัดซื้อจัดจ้าง" / "Procurement"
- `news.category.BUDDHIST_AFFAIRS`: "ศาสนกิจ" / "Buddhist Affairs"
