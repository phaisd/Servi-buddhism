-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('FORM', 'MANUAL', 'POLICY', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PUBLIC', 'INTERNAL');

-- CreateTable
CREATE TABLE "admin_documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_url" VARCHAR(1000) NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'FORM',
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admin_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_documents_tenant_id_category_visibility_idx" ON "admin_documents"("tenant_id", "category", "visibility");

-- AddForeignKey
ALTER TABLE "admin_documents" ADD CONSTRAINT "admin_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
