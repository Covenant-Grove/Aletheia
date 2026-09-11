-- CreateTable
CREATE TABLE "assessment_results" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "evidence_submission_id" UUID,
    "rubric_definition_id" UUID NOT NULL,
    "rubric_version" INTEGER NOT NULL,
    "assessor_type" TEXT NOT NULL,
    "assessor_user_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_result_scores" (
    "id" UUID NOT NULL,
    "assessment_result_id" UUID NOT NULL,
    "rubric_criterion_id" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_result_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_results_family_id_idx" ON "assessment_results"("family_id");

-- CreateIndex
CREATE INDEX "assessment_results_family_id_learner_id_idx" ON "assessment_results"("family_id", "learner_id");

-- CreateIndex
CREATE INDEX "assessment_results_evidence_submission_id_idx" ON "assessment_results"("evidence_submission_id");

-- CreateIndex
CREATE INDEX "assessment_results_rubric_definition_id_idx" ON "assessment_results"("rubric_definition_id");

-- CreateIndex
CREATE INDEX "assessment_result_scores_assessment_result_id_idx" ON "assessment_result_scores"("assessment_result_id");

-- CreateIndex
CREATE INDEX "assessment_result_scores_rubric_criterion_id_idx" ON "assessment_result_scores"("rubric_criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_result_scores_assessment_result_id_rubric_criter_key" ON "assessment_result_scores"("assessment_result_id", "rubric_criterion_id");

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_evidence_submission_id_fkey" FOREIGN KEY ("evidence_submission_id") REFERENCES "evidence_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_rubric_definition_id_fkey" FOREIGN KEY ("rubric_definition_id") REFERENCES "rubric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessor_user_id_fkey" FOREIGN KEY ("assessor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_result_scores" ADD CONSTRAINT "assessment_result_scores_assessment_result_id_fkey" FOREIGN KEY ("assessment_result_id") REFERENCES "assessment_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_result_scores" ADD CONSTRAINT "assessment_result_scores_rubric_criterion_id_fkey" FOREIGN KEY ("rubric_criterion_id") REFERENCES "rubric_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
