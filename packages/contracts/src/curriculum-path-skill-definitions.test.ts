import { describe, expect, it } from 'vitest';
import {
  createLearningPathSchema,
  createSkillDefinitionSchema,
} from './curriculum-path-skill-definitions.js';
import { createCompetencyDefinitionSchema } from './curriculum-definitions.js';

const DOMAIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const PATH_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const COMPETENCY_ID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

describe('Learning Path Contracts', () => {
  it('validates a minimal learning path with defaults', () => {
    const parsed = createLearningPathSchema.parse({
      code: 'MUSIC.BASS_TRACK',
      domainId: DOMAIN_ID,
      name: 'Trilha de Contrabaixo',
    });
    expect(parsed.status).toBe('DRAFT');
    expect(parsed.version).toBe(1);
  });

  it('validates a learning path with full metadata', () => {
    const parsed = createLearningPathSchema.parse({
      code: 'MUSIC.BASS_TRACK',
      domainId: DOMAIN_ID,
      name: 'Trilha de Contrabaixo',
      metadata: {
        levels: ['LEVEL_01', 'LEVEL_02'],
        prerequisites: ['MUSIC.RHYTHM_BASICS'],
        optional: true,
        recommended: false,
        curriculumPackCode: 'CHARLOTTE_MASON_PACK',
      },
    });
    expect(parsed.metadata.levels).toEqual(['LEVEL_01', 'LEVEL_02']);
  });

  it('rejects a lowercase path code', () => {
    expect(() =>
      createLearningPathSchema.parse({ code: 'music.bass_track', domainId: DOMAIN_ID, name: 'x' }),
    ).toThrow();
  });
});

describe('Skill Definition Contracts', () => {
  it('validates a minimal skill definition with defaults', () => {
    const parsed = createSkillDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01.RHYTHM.HOLD_TEMPO',
      competencyId: COMPETENCY_ID,
      title: 'Manter o tempo por 4 compassos',
    });
    expect(parsed.order).toBe(0);
    expect(parsed.status).toBe('DRAFT');
  });

  it('validates a skill definition with dependencies and evidence types', () => {
    const parsed = createSkillDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01.RHYTHM.HOLD_TEMPO',
      competencyId: COMPETENCY_ID,
      title: 'Manter o tempo por 4 compassos',
      order: 2,
      metadata: {
        dependencies: ['MUSIC.BASS.LEVEL_01.RHYTHM.COUNT_BEATS'],
        evidenceTypes: ['video'],
      },
    });
    expect(parsed.metadata.dependencies).toEqual(['MUSIC.BASS.LEVEL_01.RHYTHM.COUNT_BEATS']);
  });

  it('rejects a negative skill order', () => {
    expect(() =>
      createSkillDefinitionSchema.parse({
        code: 'MUSIC.BASS.LEVEL_01.RHYTHM.HOLD_TEMPO',
        competencyId: COMPETENCY_ID,
        title: 'Manter o tempo por 4 compassos',
        order: -1,
      }),
    ).toThrow();
  });
});

describe('CompetencyDefinition with pathId', () => {
  it('accepts an optional pathId', () => {
    const parsed = createCompetencyDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01.RHYTHM',
      domainId: DOMAIN_ID,
      pathId: PATH_ID,
      title: 'Manter pulsação básica no contrabaixo',
    });
    expect(parsed.pathId).toBe(PATH_ID);
  });

  it('allows omitting pathId', () => {
    const parsed = createCompetencyDefinitionSchema.parse({
      code: 'MUSIC.BASS.LEVEL_01.RHYTHM',
      domainId: DOMAIN_ID,
      title: 'Manter pulsação básica no contrabaixo',
    });
    expect(parsed.pathId).toBeUndefined();
  });
});
