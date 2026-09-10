import { CurriculumTemplateEngine } from './curriculum-template.engine.js';
import { buildPedagogicalModelDefinitionSeedRows } from './pedagogical-model-definition.seed-data.js';

describe('buildPedagogicalModelDefinitionSeedRows', () => {
  const engine = new CurriculumTemplateEngine();

  it('builds exactly the 8 template-bearing frameworks', () => {
    const rows = buildPedagogicalModelDefinitionSeedRows(engine);
    const codes = rows.map((row) => row.code).sort();
    expect(codes).toEqual(
      [
        'CHARLOTTE_MASON',
        'CLASSICAL_TRIVIUM',
        'ECLECTIC',
        'GUIDED_UNSCHOOLING',
        'MONTESSORI',
        'PROJECT_BASED',
        'TRADITIONAL',
        'UNIT_STUDIES',
      ].sort(),
    );
  });

  it('reuses CurriculumTemplateEngine output verbatim for every row', () => {
    const rows = buildPedagogicalModelDefinitionSeedRows(engine);
    for (const row of rows) {
      expect(row.subjects).toEqual(engine.getTemplateDefinitions(row.code));
    }
  });

  it('gives every row a human-readable name and description', () => {
    const rows = buildPedagogicalModelDefinitionSeedRows(engine);
    for (const row of rows) {
      expect(row.name.length).toBeGreaterThan(0);
      expect(row.description.length).toBeGreaterThan(0);
    }
  });
});
