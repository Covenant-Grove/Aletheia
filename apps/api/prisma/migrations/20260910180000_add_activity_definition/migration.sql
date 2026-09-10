-- CreateTable
CREATE TABLE "activity_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "age_min" INTEGER,
    "age_max" INTEGER,
    "estimated_duration_minutes" INTEGER,
    "supervision_required" BOOLEAN NOT NULL DEFAULT false,
    "risk_level" TEXT,
    "evidence_requirement_mode" TEXT NOT NULL DEFAULT 'ANY',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "activity_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_definition_competencies" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_definition_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_definition_evidence_types" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "evidence_type_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_definition_evidence_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_definition_activities" (
    "id" UUID NOT NULL,
    "curriculum_definition_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_definition_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_definitions_code_version_key" ON "activity_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "activity_definitions_code_idx" ON "activity_definitions"("code");

-- CreateIndex
CREATE INDEX "activity_definitions_status_idx" ON "activity_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_definition_competencies_activity_id_competency_i_key" ON "activity_definition_competencies"("activity_id", "competency_id");

-- CreateIndex
CREATE INDEX "activity_definition_competencies_activity_id_idx" ON "activity_definition_competencies"("activity_id");

-- CreateIndex
CREATE INDEX "activity_definition_competencies_competency_id_idx" ON "activity_definition_competencies"("competency_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_definition_evidence_types_activity_id_evidence_t_key" ON "activity_definition_evidence_types"("activity_id", "evidence_type_id");

-- CreateIndex
CREATE INDEX "activity_definition_evidence_types_activity_id_idx" ON "activity_definition_evidence_types"("activity_id");

-- CreateIndex
CREATE INDEX "activity_definition_evidence_types_evidence_type_id_idx" ON "activity_definition_evidence_types"("evidence_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_definition_activities_curriculum_definition_id_key" ON "curriculum_definition_activities"("curriculum_definition_id", "activity_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_activities_curriculum_definition_id_idx" ON "curriculum_definition_activities"("curriculum_definition_id");

-- CreateIndex
CREATE INDEX "curriculum_definition_activities_activity_id_idx" ON "curriculum_definition_activities"("activity_id");

-- AddForeignKey
ALTER TABLE "activity_definition_competencies" ADD CONSTRAINT "activity_definition_competencies_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_definition_competencies" ADD CONSTRAINT "activity_definition_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_definition_evidence_types" ADD CONSTRAINT "activity_definition_evidence_types_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_definition_evidence_types" ADD CONSTRAINT "activity_definition_evidence_types_evidence_type_id_fkey" FOREIGN KEY ("evidence_type_id") REFERENCES "evidence_type_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_activities" ADD CONSTRAINT "curriculum_definition_activities_curriculum_definition_i_fkey" FOREIGN KEY ("curriculum_definition_id") REFERENCES "curriculum_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_definition_activities" ADD CONSTRAINT "curriculum_definition_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
