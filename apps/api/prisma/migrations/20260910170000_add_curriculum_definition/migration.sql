-- CreateTable
CREATE TABLE "curriculum_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pedagogical_model_definition_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "curriculum_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_definition_domains" (
    "id" UUID NOT NULL,
    "curriculum_definition_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_definition_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_definition_competencies" (
    "id" UUID NOT NULL,
    "curriculum_definition_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_definition_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_definition_rubrics" (
    "id" UUID NOT NULL,
    "curriculum_definition_id" UUID NOT NULL,
    "rubric_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_definition_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_definitions_code_version_key" ON "curriculum_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "curriculum_definitions_code_idx" ON "curriculum_definitions"("code");

-- CreateIndex
CREATE INDEX "curriculum_definitions_pedagogical_model_definition_id_idx" ON "curriculum_definitions"("pedagogical_model_definition_id");

-- CreateIndex
CREATE INDEX "curriculum_definitions_status_idx" ON "curriculum_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_definition_domains_curriculum_definition_id_do_key" ON "curriculum_definition_domains"("curriculum_definition_id", "domain_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_domains_curriculum_definition_id_idx" ON "curriculum_definition_domains"("curriculum_definition_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_domains_domain_id_idx" ON "curriculum_definition_domains"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_definition_competencies_curriculum_definition__key" ON "curriculum_definition_competencies"("curriculum_definition_id", "competency_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_competencies_curriculum_definition__idx1" ON "curriculum_definition_competencies"("curriculum_definition_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_competencies_competency_id_idx" ON "curriculum_definition_competencies"("competency_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_definition_rubrics_curriculum_definition_id_ru_key" ON "curriculum_definition_rubrics"("curriculum_definition_id", "rubric_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_rubrics_curriculum_definition_id_idx" ON "curriculum_definition_rubrics"("curriculum_definition_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_rubrics_rubric_id_idx" ON "curriculum_definition_rubrics"("rubric_id");

-- AddForeignKey
ALTER TABLE "curriculum_definitions" ADD CONSTRAINT "curriculum_definitions_pedagogical_model_definition_id_fkey" FOREIGN KEY ("pedagogical_model_definition_id") REFERENCES "pedagogical_model_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_domains" ADD CONSTRAINT "curriculum_definition_domains_curriculum_definition_id_fkey" FOREIGN KEY ("curriculum_definition_id") REFERENCES "curriculum_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_domains" ADD CONSTRAINT "curriculum_definition_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "learning_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_competencies" ADD CONSTRAINT "curriculum_definition_competencies_curriculum_definition_fkey" FOREIGN KEY ("curriculum_definition_id") REFERENCES "curriculum_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_competencies" ADD CONSTRAINT "curriculum_definition_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_rubrics" ADD CONSTRAINT "curriculum_definition_rubrics_curriculum_definition_id_fkey" FOREIGN KEY ("curriculum_definition_id") REFERENCES "curriculum_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_rubrics" ADD CONSTRAINT "curriculum_definition_rubrics_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "rubric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
