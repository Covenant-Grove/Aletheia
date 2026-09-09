-- CreateTable
CREATE TABLE "learner_access_grants" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regenerated_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "last_used_at" TIMESTAMPTZ,

    CONSTRAINT "learner_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_access_attempts" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "learner_access_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learner_access_grants_learner_id_key" ON "learner_access_grants"("learner_id");

-- CreateIndex
CREATE INDEX "learner_access_grants_family_id_idx" ON "learner_access_grants"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "learner_access_attempts_learner_id_key" ON "learner_access_attempts"("learner_id");

-- AddForeignKey
ALTER TABLE "learner_access_grants" ADD CONSTRAINT "learner_access_grants_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
