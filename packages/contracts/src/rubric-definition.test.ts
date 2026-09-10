import { describe, expect, it } from 'vitest';
import { createRubricDefinitionSchema, createRubricCriterionSchema } from './rubric-definition.js';

const COMPETENCY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

describe('Rubric Definition Contracts', () => {
  it('validates a minimal rubric with defaults', () => {
    const parsed = createRubricDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01_RUBRIC',
      name: 'Rubrica de Contrabaixo Nível 1',
    });
    expect(parsed.status).toBe('DRAFT');
    expect(parsed.competencyId).toBeUndefined();
  });

  it('validates a rubric scoped to a competency with assessment modes', () => {
    const parsed = createRubricDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01_RUBRIC',
      name: 'Rubrica de Contrabaixo Nível 1',
      competencyId: COMPETENCY_ID,
      metadata: { assessmentModes: ['mentor', 'self'] },
    });
    expect(parsed.metadata.assessmentModes).toEqual(['mentor', 'self']);
  });

  it('rejects a lowercase rubric code', () => {
    expect(() =>
      createRubricDefinitionSchema.parse({ code: 'music.bass.rubric', name: 'x' }),
    ).toThrow();
  });
});

describe('Rubric Criterion Contracts', () => {
  it('validates a minimal criterion with defaults', () => {
    const parsed = createRubricCriterionSchema.parse({
      code: 'TEMPO',
      label: 'Manutenção do tempo',
    });
    expect(parsed.weight).toBe(1);
    expect(parsed.scaleMin).toBe(0);
    expect(parsed.scaleMax).toBe(4);
  });

  it('validates a criterion with a custom weight and scale', () => {
    const parsed = createRubricCriterionSchema.parse({
      code: 'TEMPO',
      label: 'Manutenção do tempo',
      weight: 2.5,
      scaleMin: 1,
      scaleMax: 5,
      metadata: { scaleLabels: { '1': 'Iniciante', '5': 'Domínio' } },
    });
    expect(parsed.weight).toBe(2.5);
    expect(parsed.metadata.scaleLabels?.['5']).toBe('Domínio');
  });

  it('rejects a negative weight', () => {
    expect(() =>
      createRubricCriterionSchema.parse({ code: 'TEMPO', label: 'x', weight: -1 }),
    ).toThrow();
  });
});
