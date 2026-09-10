-- CreateTable
CREATE TABLE "learning_paths" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "domain_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_code_version_key" ON "learning_paths"("code", "version");

-- CreateIndex
CREATE INDEX "learning_paths_code_idx" ON "learning_paths"("code");

-- CreateIndex
CREATE INDEX "learning_paths_domain_id_idx" ON "learning_paths"("domain_id");

-- CreateIndex
CREATE INDEX "learning_paths_status_idx" ON "learning_paths"("status");

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "learning_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: competency_definitions gains an optional path_id column
-- (safe default NULL -- every existing row is unaffected)
ALTER TABLE "competency_definitions" ADD COLUMN "path_id" UUID;

-- CreateIndex
CREATE INDEX "competency_definitions_path_id_idx" ON "competency_definitions"("path_id");

-- AddForeignKey
ALTER TABLE "competency_definitions" ADD CONSTRAINT "competency_definitions_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "skill_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "competency_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "skill_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_definitions_code_version_key" ON "skill_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "skill_definitions_code_idx" ON "skill_definitions"("code");

-- CreateIndex
CREATE INDEX "skill_definitions_competency_id_idx" ON "skill_definitions"("competency_id");

-- CreateIndex
CREATE INDEX "skill_definitions_status_idx" ON "skill_definitions"("status");

-- AddForeignKey
ALTER TABLE "skill_definitions" ADD CONSTRAINT "skill_definitions_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
