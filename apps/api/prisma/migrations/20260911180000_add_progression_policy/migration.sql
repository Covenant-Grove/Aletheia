-- CreateTable
CREATE TABLE "progression_policies" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "policy_type" TEXT NOT NULL,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "competency_definition_id" UUID,
    "curriculum_definition_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "progression_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progression_policies_code_idx" ON "progression_policies"("code");

-- CreateIndex
CREATE INDEX "progression_policies_status_idx" ON "progression_policies"("status");

-- CreateIndex
CREATE INDEX "progression_policies_competency_definition_id_idx" ON "progression_policies"("competency_definition_id");

-- CreateIndex
CREATE INDEX "progression_policies_curriculum_definition_id_idx" ON "progression_policies"("curriculum_definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "progression_policies_code_version_key" ON "progression_policies"("code", "version");

-- AddForeignKey
ALTER TABLE "progression_policies" ADD CONSTRAINT "progression_policies_competency_definition_id_fkey" FOREIGN KEY ("competency_definition_id") REFERENCES "competency_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_policies" ADD CONSTRAINT "progression_policies_curriculum_definition_id_fkey" FOREIGN KEY ("curriculum_definition_id") REFERENCES "curriculum_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
