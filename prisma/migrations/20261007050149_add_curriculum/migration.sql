-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORATE', 'CERTIFICATE');

-- CreateTable
CREATE TABLE "curriculums" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "degree" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "description_th" TEXT,
    "description_en" TEXT,
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_degree_idx" ON "curriculums"("tenant_id", "degree");

-- AddForeignKey
ALTER TABLE "curriculums" ADD CONSTRAINT "curriculums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
