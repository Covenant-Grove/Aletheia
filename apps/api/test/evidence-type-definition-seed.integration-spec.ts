import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApplication } from '../src/main.js';
import { EvidenceTypeDefinitionSeeder } from '../src/modules/curriculum/infrastructure/evidence-type-definition.seeder.js';
import { PrismaService } from '../src/platform/database/prisma.service.js';
import { BASE_EVIDENCE_TYPE_SEED_ROWS } from '../src/modules/curriculum/infrastructure/evidence-type-definition.seed-data.js';

// Proves the seeder actually publishes the base evidence type catalog
// (issue #96 section 9) against real Postgres, and that re-running it is
// idempotent (upsert, not duplicate rows).
describe('EvidenceTypeDefinitionSeeder (real Postgres)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('publishes every base evidence type and is idempotent on re-run', async () => {
    const seeder = app.get(EvidenceTypeDefinitionSeeder);

    const firstRunCount = await seeder.seed();
    expect(firstRunCount).toBe(BASE_EVIDENCE_TYPE_SEED_ROWS.length);

    const secondRunCount = await seeder.seed();
    expect(secondRunCount).toBe(BASE_EVIDENCE_TYPE_SEED_ROWS.length);

    for (const row of BASE_EVIDENCE_TYPE_SEED_ROWS) {
      const stored = await prisma.evidenceTypeDefinition.findMany({
        where: { code: row.code },
      });
      expect(stored).toHaveLength(1);
      expect(stored[0]?.status).toBe('PUBLISHED');
      expect(stored[0]?.name).toBe(row.name);
    }
  });
});
