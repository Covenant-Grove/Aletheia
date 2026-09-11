import { describe, expect, it } from 'vitest';
import { createAssessmentResultSchema } from './assessment-result.js';

const LEARNER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const RUBRIC_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const CRITERION_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const EVIDENCE_ID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

describe('Assessment Result Contracts', () => {
  it('validates a minimal result tied to an evidence submission', () => {
    const parsed = createAssessmentResultSchema.parse({
      learnerId: LEARNER_ID,
      evidenceSubmissionId: EVIDENCE_ID,
      rubricDefinitionId: RUBRIC_ID,
      assessorType: 'PARENT',
      scores: [{ rubricCriterionId: CRITERION_ID, score: 3 }],
    });
    expect(parsed.evidenceSubmissionId).toBe(EVIDENCE_ID);
    expect(parsed.scores).toHaveLength(1);
  });

  it('allows a standalone self-assessment with no evidence submission', () => {
    const parsed = createAssessmentResultSchema.parse({
      learnerId: LEARNER_ID,
      rubricDefinitionId: RUBRIC_ID,
      assessorType: 'SELF',
      scores: [{ rubricCriterionId: CRITERION_ID, score: 2 }],
    });
    expect(parsed.evidenceSubmissionId).toBeUndefined();
  });

  it('accepts a free-form assessorType, not a closed enum', () => {
    const parsed = createAssessmentResultSchema.parse({
      learnerId: LEARNER_ID,
      rubricDefinitionId: RUBRIC_ID,
      assessorType: 'CO_OP_INSTRUCTOR',
      scores: [{ rubricCriterionId: CRITERION_ID, score: 1 }],
    });
    expect(parsed.assessorType).toBe('CO_OP_INSTRUCTOR');
  });

  it('rejects a result with zero scores', () => {
    expect(() =>
      createAssessmentResultSchema.parse({
        learnerId: LEARNER_ID,
        rubricDefinitionId: RUBRIC_ID,
        assessorType: 'SELF',
        scores: [],
      }),
    ).toThrow();
  });
});
