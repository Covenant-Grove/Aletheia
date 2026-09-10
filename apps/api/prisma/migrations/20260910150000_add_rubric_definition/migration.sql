-- CreateTable
CREATE TABLE "rubric_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "competency_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "rubric_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" UUID NOT NULL,
    "rubric_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "scale_min" INTEGER NOT NULL DEFAULT 0,
    "scale_max" INTEGER NOT NULL DEFAULT 4,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rubric_definitions_code_version_key" ON "rubric_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "rubric_definitions_code_idx" ON "rubric_definitions"("code");

-- CreateIndex
CREATE INDEX "rubric_definitions_competency_id_idx" ON "rubric_definitions"("competency_id");

-- CreateIndex
CREATE INDEX "rubric_definitions_status_idx" ON "rubric_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criteria_rubric_id_code_key" ON "rubric_criteria"("rubric_id", "code");

-- CreateIndex
CREATE INDEX "rubric_criteria_rubric_id_idx" ON "rubric_criteria"("rubric_id");

-- AddForeignKey
ALTER TABLE "rubric_definitions" ADD CONSTRAINT "rubric_definitions_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubric_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
