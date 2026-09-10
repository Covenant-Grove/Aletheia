-- CreateTable
CREATE TABLE "evidence_type_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "evidence_type_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evidence_type_definitions_code_version_key" ON "evidence_type_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "evidence_type_definitions_code_idx" ON "evidence_type_definitions"("code");

-- CreateIndex
CREATE INDEX "evidence_type_definitions_status_idx" ON "evidence_type_definitions"("status");
