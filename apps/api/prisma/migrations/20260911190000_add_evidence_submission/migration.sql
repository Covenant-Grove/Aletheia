-- CreateEnum
CREATE TYPE "evidence_validation_statuses" AS ENUM ('UNVALIDATED', 'VALIDATED', 'REJECTED');

-- CreateTable
CREATE TABLE "evidence_submissions" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "evidence_type_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "text_content" TEXT,
    "file_url" TEXT,
    "storage_key" TEXT,
    "mime_type" TEXT,
    "file_size_bytes" INTEGER,
    "checksum_sha256" TEXT,
    "validation_status" "evidence_validation_statuses" NOT NULL DEFAULT 'UNVALIDATED',
    "validated_by_user_id" UUID,
    "validated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_submission_competencies" (
    "id" UUID NOT NULL,
    "evidence_submission_id" UUID NOT NULL,
    "competency_definition_id" UUID NOT NULL,
    "competency_version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_submission_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evidence_submissions_storage_key_key" ON "evidence_submissions"("storage_key");

-- CreateIndex
CREATE INDEX "evidence_submissions_family_id_idx" ON "evidence_submissions"("family_id");

-- CreateIndex
CREATE INDEX "evidence_submissions_family_id_learner_id_idx" ON "evidence_submissions"("family_id", "learner_id");

-- CreateIndex
CREATE INDEX "evidence_submissions_evidence_type_id_idx" ON "evidence_submissions"("evidence_type_id");

-- CreateIndex
CREATE INDEX "evidence_submission_competencies_evidence_submission_id_idx" ON "evidence_submission_competencies"("evidence_submission_id");

-- CreateIndex
CREATE INDEX "evidence_submission_competencies_competency_definition_id_idx" ON "evidence_submission_competencies"("competency_definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_submission_competencies_evidence_submission_id_com_key" ON "evidence_submission_competencies"("evidence_submission_id", "competency_definition_id");

-- AddForeignKey
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_evidence_type_id_fkey" FOREIGN KEY ("evidence_type_id") REFERENCES "evidence_type_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_validated_by_user_id_fkey" FOREIGN KEY ("validated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submission_competencies" ADD CONSTRAINT "evidence_submission_competencies_evidence_submission_id_fkey" FOREIGN KEY ("evidence_submission_id") REFERENCES "evidence_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_submission_competencies" ADD CONSTRAINT "evidence_submission_competencies_competency_definition_id_fkey" FOREIGN KEY ("competency_definition_id") REFERENCES "competency_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
