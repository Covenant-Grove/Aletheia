-- CreateTable
CREATE TABLE "theological_tradition_definitions" (
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

    CONSTRAINT "theological_tradition_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theological_position_definitions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "definition_statuses" NOT NULL DEFAULT 'DRAFT',
    "schema_version" TEXT NOT NULL DEFAULT '1.0.0',
    "tradition_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "deprecated_at" TIMESTAMPTZ,

    CONSTRAINT "theological_position_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "theological_tradition_definitions_code_version_key" ON "theological_tradition_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "theological_tradition_definitions_code_idx" ON "theological_tradition_definitions"("code");

-- CreateIndex
CREATE INDEX "theological_tradition_definitions_status_idx" ON "theological_tradition_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "theological_position_definitions_code_version_key" ON "theological_position_definitions"("code", "version");

-- CreateIndex
CREATE INDEX "theological_position_definitions_code_idx" ON "theological_position_definitions"("code");

-- CreateIndex
CREATE INDEX "theological_position_definitions_tradition_id_idx" ON "theological_position_definitions"("tradition_id");

-- CreateIndex
CREATE INDEX "theological_position_definitions_topic_idx" ON "theological_position_definitions"("topic");

-- CreateIndex
CREATE INDEX "theological_position_definitions_status_idx" ON "theological_position_definitions"("status");

-- AddForeignKey
ALTER TABLE "theological_position_definitions" ADD CONSTRAINT "theological_position_definitions_tradition_id_fkey" FOREIGN KEY ("tradition_id") REFERENCES "theological_tradition_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
