import { describe, expect, it } from 'vitest';
import { createProgressionPolicySchema } from './progression-policy.js';

describe('Progression Policy Contracts', () => {
  it('validates a minimal policy with defaults', () => {
    const parsed = createProgressionPolicySchema.parse({
      code: 'MASTERY.DEFAULT',
      name: 'Mastery-based progression',
      policyType: 'MASTERY',
    });
    expect(parsed.status).toBe('DRAFT');
    expect(parsed.rules).toEqual({});
  });

  it('accepts a free-form policyType, not a closed enum', () => {
    const parsed = createProgressionPolicySchema.parse({
      code: 'CUSTOM.NEW_POLICY_TYPE',
      name: 'Anything',
      policyType: 'SOME_FUTURE_POLICY_TYPE_NOT_YET_INVENTED',
    });
    expect(parsed.policyType).toBe('SOME_FUTURE_POLICY_TYPE_NOT_YET_INVENTED');
  });

  it('accepts arbitrary rules JSON', () => {
    const parsed = createProgressionPolicySchema.parse({
      code: 'HOURS.DEFAULT',
      name: 'Hours-based progression',
      policyType: 'HOURS',
      rules: { minimumHours: 40, requiresMentorSignOff: true },
    });
    expect(parsed.rules).toEqual({ minimumHours: 40, requiresMentorSignOff: true });
  });

  it('rejects a lowercase code', () => {
    expect(() =>
      createProgressionPolicySchema.parse({ code: 'mastery.default', name: 'x', policyType: 'MASTERY' }),
    ).toThrow();
  });

  it('optionally scopes to a competency or curriculum definition', () => {
    const competencyId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const parsed = createProgressionPolicySchema.parse({
      code: 'MASTERY.SCOPED',
      name: 'Scoped policy',
      policyType: 'MASTERY',
      competencyDefinitionId: competencyId,
    });
    expect(parsed.competencyDefinitionId).toBe(competencyId);
    expect(parsed.curriculumDefinitionId).toBeUndefined();
  });
});
