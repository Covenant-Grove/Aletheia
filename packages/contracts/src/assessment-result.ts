import { z } from 'zod';

// --- Assessment result (Aletheia issue #96, Fase 2, section 10's last
// item: "resultado guarda qual versão foi usada") ---
//
// Links an EvidenceSubmission (optional -- can stand alone for e.g. a
// pure self-assessment) to a RubricDefinition, with per-criterion scores
// referencing RubricCriterion. `assessorType` is free-form
// (SELF/PARENT/MENTOR/...), reusing the same "not a closed enum"
// philosophy already established for RubricDefinition.metadata.
// assessmentModes -- a new assessor role is a data value, not a
// migration.

export const assessmentResultScoreInputSchema = z.object({
  rubricCriterionId: z.string().uuid(),
  score: z.number(),
  notes: z.string().max(2000).nullish(),
});

export const createAssessmentResultSchema = z.object({
  learnerId: z.string().uuid(),
  evidenceSubmissionId: z.string().uuid().nullish(),
  rubricDefinitionId: z.string().uuid(),
  assessorType: z.string().min(1).max(100),
  assessorUserId: z.string().uuid().nullish(),
  notes: z.string().max(2000).nullish(),
  scores: z.array(assessmentResultScoreInputSchema).min(1),
});

export type CreateAssessmentResultDto = z.input<typeof createAssessmentResultSchema>;
export type CreateAssessmentResultOutput = z.output<typeof createAssessmentResultSchema>;

export const assessmentResultScoreResponseSchema = z.object({
  id: z.string().uuid(),
  assessmentResultId: z.string().uuid(),
  rubricCriterionId: z.string().uuid(),
  score: z.number(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type AssessmentResultScoreResponseDto = z.infer<typeof assessmentResultScoreResponseSchema>;

export const assessmentResultResponseSchema = z.object({
  id: z.string().uuid(),
  familyId: z.string().uuid(),
  learnerId: z.string().uuid(),
  evidenceSubmissionId: z.string().uuid().nullable().optional(),
  rubricDefinitionId: z.string().uuid(),
  rubricVersion: z.number().int(),
  assessorType: z.string(),
  assessorUserId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  scores: z.array(assessmentResultScoreResponseSchema),
});

export type AssessmentResultResponseDto = z.infer<typeof assessmentResultResponseSchema>;
