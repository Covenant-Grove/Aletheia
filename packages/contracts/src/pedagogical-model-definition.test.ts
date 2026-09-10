import { describe, expect, it } from 'vitest';
import {
  createPedagogicalModelDefinitionSchema,
  templateSubjectDefinitionSchema,
} from './pedagogical-model-definition.js';

describe('Pedagogical Model Definition Contracts', () => {
  it('validates a TemplateSubjectDefinition-shaped subject', () => {
    const parsed = templateSubjectDefinitionSchema.parse({
      name: 'Vida Prática',
      color: '#CA8A04',
      icon: 'scissors',
      description: 'Cuidado pessoal e do ambiente.',
      starterObjectives: ['Executar uma sequência de cuidado do ambiente'],
    });
    expect(parsed.name).toBe('Vida Prática');
  });

  it('defaults starterObjectives to an empty array', () => {
    const parsed = templateSubjectDefinitionSchema.parse({
      name: 'Vida Prática',
      color: '#CA8A04',
      description: 'Cuidado pessoal e do ambiente.',
    });
    expect(parsed.starterObjectives).toEqual([]);
  });

  it('rejects an invalid subject color', () => {
    expect(() =>
      templateSubjectDefinitionSchema.parse({
        name: 'Vida Prática',
        color: 'gold',
        description: 'Cuidado pessoal e do ambiente.',
      }),
    ).toThrow();
  });

  it('validates a minimal pedagogical model definition with defaults', () => {
    const parsed = createPedagogicalModelDefinitionSchema.parse({
      code: 'MONTESSORI',
      name: 'Montessori',
    });
    expect(parsed.status).toBe('DRAFT');
    expect(parsed.version).toBe(1);
  });

  it('validates a pedagogical model definition with subjects in metadata', () => {
    const parsed = createPedagogicalModelDefinitionSchema.parse({
      code: 'MONTESSORI',
      name: 'Montessori',
      status: 'PUBLISHED',
      metadata: {
        subjects: [
          {
            name: 'Vida Prática',
            color: '#CA8A04',
            icon: 'scissors',
            description: 'Cuidado pessoal e do ambiente.',
            starterObjectives: ['Executar uma sequência de cuidado do ambiente'],
          },
        ],
      },
    });
    expect(parsed.metadata.subjects?.[0]?.name).toBe('Vida Prática');
  });

  it('rejects a lowercase framework code', () => {
    expect(() =>
      createPedagogicalModelDefinitionSchema.parse({ code: 'montessori', name: 'Montessori' }),
    ).toThrow();
  });
});
