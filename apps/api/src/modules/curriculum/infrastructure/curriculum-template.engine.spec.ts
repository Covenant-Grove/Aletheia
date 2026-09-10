import { CurriculumTemplateEngine } from './curriculum-template.engine.js';
import type { PedagogicalFramework } from '@aletheia/contracts';

describe('CurriculumTemplateEngine', () => {
  const engine = new CurriculumTemplateEngine();

  const TEMPLATE_BEARING_FRAMEWORKS: PedagogicalFramework[] = [
    'CLASSICAL_TRIVIUM',
    'CHARLOTTE_MASON',
    'TRADITIONAL',
    'UNIT_STUDIES',
    'MONTESSORI',
    'PROJECT_BASED',
    'GUIDED_UNSCHOOLING',
    'ECLECTIC',
  ];

  const CROSS_CUTTING_SUBJECT_NAMES = [
    'Musicalização e Artes',
    'Ofícios Práticos',
    'Tecnologia e Criação',
    'Vocação e Serviço',
    'Fundamentos da Fé Cristã',
    'Estudo das Escrituras',
    'Casa, Culinária e Cultivo',
    'Primeiros Socorros e Resiliência',
  ];

  it.each(TEMPLATE_BEARING_FRAMEWORKS)('returns a non-empty definition list for %s', (framework) => {
    const definitions = engine.getTemplateDefinitions(framework);
    expect(definitions.length).toBeGreaterThan(0);
  });

  it.each(TEMPLATE_BEARING_FRAMEWORKS)('includes every cross-cutting subject for %s', (framework) => {
    const names = engine.getTemplateDefinitions(framework).map((d) => d.name);
    for (const crossCuttingName of CROSS_CUTTING_SUBJECT_NAMES) {
      expect(names).toContain(crossCuttingName);
    }
  });

  it('falls back to the TRADITIONAL definitions for CUSTOM', () => {
    const custom = engine.getTemplateDefinitions('CUSTOM');
    const traditional = engine.getTemplateDefinitions('TRADITIONAL');
    expect(custom).toEqual(traditional);
  });
});
