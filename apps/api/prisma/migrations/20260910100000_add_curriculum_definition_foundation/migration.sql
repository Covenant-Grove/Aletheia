-- CreateEnum
CREATE TYPE "definition_statuses" AS ENUM ('DRAFT', 'PUBLISHED', 'DEPRECATED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "learning_domains" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "learning_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "domain_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "competency_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_domains_code_version_key" ON "learning_domains"("code", "version");

-- CreateIndex
CREATE INDEX "learning_domains_code_idx" ON "learning_domains"("code");

-- CreateIndex
CREATE INDEX "learning_domains_parent_id_idx" ON "learning_domains"("parent_id");

-- CreateIndex
CREATE INDEX "learning_domains_status_idx" ON "learning_domains"("status");

-- CreateIndex
CREATE UNIQUE INDEX "competency_definitions_code_version_key" ON "competency_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "competency_definitions_code_idx" ON "competency_definitions"("code");

-- CreateIndex
CREATE INDEX "competency_definitions_domain_id_idx" ON "competency_definitions"("domain_id");

-- CreateIndex
CREATE INDEX "competency_definitions_status_idx" ON "competency_definitions"("status");

-- AddForeignKey
ALTER TABLE "learning_domains" ADD CONSTRAINT "learning_domains_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "learning_domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_definitions" ADD CONSTRAINT "competency_definitions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "learning_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
