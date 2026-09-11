ALTER TABLE "learner_curriculum_plans" ADD COLUMN "pedagogical_model_definition_id" UUID;
ALTER TABLE "learner_curriculum_plans" ADD CONSTRAINT "learner_curriculum_plans_pedagogical_model_definition_id_fkey" FOREIGN KEY ("pedagogical_model_definition_id") REFERENCES "pedagogical_model_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
