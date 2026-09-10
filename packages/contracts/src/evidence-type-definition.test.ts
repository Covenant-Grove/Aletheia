import { describe, expect, it } from 'vitest';
import { createEvidenceTypeDefinitionSchema } from './evidence-type-definition.js';

describe('Evidence Type Definition Contracts', () => {
  it('validates a minimal evidence type with defaults', () => {
    const parsed = createEvidenceTypeDefinitionSchema.parse({
      code: 'PHOTO',
      name: 'Foto',
    });
    expect(parsed.status).toBe('DRAFT');
    expect(parsed.version).toBe(1);
  });

  it('validates an evidence type with full metadata', () => {
    const parsed = createEvidenceTypeDefinitionSchema.parse({
      code: 'VIDEO',
      name: 'Vídeo',
      metadata: {
        acceptedMimeTypes: ['video/mp4', 'video/webm'],
        maxSizeMb: 500,
        requiresValidation: true,
      },
    });
    expect(parsed.metadata.acceptedMimeTypes).toEqual(['video/mp4', 'video/webm']);
    expect(parsed.metadata.requiresValidation).toBe(true);
  });

  it('rejects a lowercase evidence type code', () => {
    expect(() =>
      createEvidenceTypeDefinitionSchema.parse({ code: 'photo', name: 'Foto' }),
    ).toThrow();
  });

  it('rejects a non-positive maxSizeMb', () => {
    expect(() =>
      createEvidenceTypeDefinitionSchema.parse({
        code: 'PHOTO',
        name: 'Foto',
        metadata: { maxSizeMb: 0 },
      }),
    ).toThrow();
  });
});
