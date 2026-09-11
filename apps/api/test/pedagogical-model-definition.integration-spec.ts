import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { PedagogicalFramework } from '@aletheia/contracts';
import { createApplication } from '../src/main.js';
import { CurriculumTemplateEngine } from '../src/modules/curriculum/infrastructure/curriculum-template.engine.js';
import { PedagogicalModelDefinitionResolver } from '../src/modules/curriculum/infrastructure/pedagogical-model-definition.resolver.js';
import { PedagogicalModelDefinitionSeeder } from '../src/modules/curriculum/infrastructure/pedagogical-model-definition.seeder.js';
import { PrismaService } from '../src/platform/database/prisma.service.js';

// Proves the data-driven resolver (reads pedagogical_model_definitions from
// Postgres) is equivalent to the pre-existing hardcoded
// CurriculumTemplateEngine switch-case, for every framework it covers --
// the acceptance bar for issue #96 Fase 0, deliverable 4. Both code paths
// are compared here only as a compatibility proof. The application reads
// the catalog; the old engine is a baseline fixture for migration content.
describe('Pedagogical model definition resolver equivalence (real Postgres)', () => {
  let app: NestFastifyApplication;
  let resolver: PedagogicalModelDefinitionResolver;
  const engine = new CurriculumTemplateEngine();

  const TEMPLATE_BEARING_FRAMEWORKS: Exclude<PedagogicalFramework, 'CUSTOM'>[] = [
    'CLASSICAL_TRIVIUM',
    'CHARLOTTE_MASON',
    'TRADITIONAL',
    'UNIT_STUDIES',
    'MONTESSORI',
    'PROJECT_BASED',
    'GUIDED_UNSCHOOLING',
    'ECLECTIC',
  ];

  beforeAll(async () => {
    app = await createApplication();
    await app.init();

    // Do not seed here: this must prove migration-only installations work.
    resolver = app.get(PedagogicalModelDefinitionResolver);
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(TEMPLATE_BEARING_FRAMEWORKS)(
    'returns the exact same subject definitions as CurriculumTemplateEngine for %s',
    async (framework) => {
      const fromData = await resolver.getSubjectDefinitions(framework);
      const fromEngine = engine.getTemplateDefinitions(framework);
      expect(fromData).toEqual(fromEngine);
    },
  );

  it('returns an empty list for a code with no PUBLISHED definition', async () => {
    const result = await resolver.getSubjectDefinitions('DOES_NOT_EXIST');
    expect(result).toEqual([]);
  });

  it('preserves the migration-installed versions when the seed is rerun', async () => {
    const prisma = app.get(PrismaService);
    const query = { where: { code: { in: TEMPLATE_BEARING_FRAMEWORKS }, version: 1 }, orderBy: { code: 'asc' as const } };
    const before = await prisma.pedagogicalModelDefinition.findMany(query);
    expect(before).toHaveLength(8);
    await app.get(PedagogicalModelDefinitionSeeder).seed();
    const after = await prisma.pedagogicalModelDefinition.findMany(query);
    expect(after).toEqual(before);
  });
});
