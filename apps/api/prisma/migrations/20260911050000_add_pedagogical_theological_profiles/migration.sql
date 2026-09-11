-- CreateTable
CREATE TABLE "pedagogical_profiles" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "primary_model_code" TEXT NOT NULL,
    "secondary_models" JSONB NOT NULL DEFAULT '[]',
    "overrides" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedagogical_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theological_profiles" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "preferred_tradition_code" TEXT,
    "topic_overrides" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theological_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedagogical_profiles_family_id_version_key" ON "pedagogical_profiles"("family_id", "version");

-- CreateIndex
CREATE INDEX "pedagogical_profiles_family_id_idx" ON "pedagogical_profiles"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "theological_profiles_family_id_version_key" ON "theological_profiles"("family_id", "version");

-- CreateIndex
CREATE INDEX "theological_profiles_family_id_idx" ON "theological_profiles"("family_id");

-- AddForeignKey
ALTER TABLE "pedagogical_profiles" ADD CONSTRAINT "pedagogical_profiles_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theological_profiles" ADD CONSTRAINT "theological_profiles_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
