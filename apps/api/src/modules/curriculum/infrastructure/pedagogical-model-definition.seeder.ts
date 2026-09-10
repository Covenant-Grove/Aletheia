import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import { CurriculumTemplateEngine } from './curriculum-template.engine.js';
import { buildPedagogicalModelDefinitionSeedRows } from './pedagogical-model-definition.seed-data.js';

// Upserts the 8 pedagogical-model-definition rows described in
// pedagogical-model-definition.seed-data.ts. Idempotent: re-running it
// (e.g. after CurriculumTemplateEngine content changes) updates the
// PUBLISHED version-1 row in place rather than creating duplicates, since
// this is still the strangler-fig phase and there is no admin UI yet to
// publish a new version through.
@Injectable()
export class PedagogicalModelDefinitionSeeder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: CurriculumTemplateEngine,
  ) {}

  async seed(): Promise<number> {
    const rows = buildPedagogicalModelDefinitionSeedRows(this.engine);
    const now = new Date();

    for (const row of rows) {
      await this.prisma.pedagogicalModelDefinition.upsert({
        where: { code_version: { code: row.code, version: 1 } },
        create: {
          code: row.code,
          version: 1,
          status: 'PUBLISHED',
          name: row.name,
          description: row.description,
          metadata: { subjects: row.subjects },
          publishedAt: now,
        },
        update: {
          status: 'PUBLISHED',
          name: row.name,
          description: row.description,
          metadata: { subjects: row.subjects },
          publishedAt: now,
        },
      });
    }

    return rows.length;
  }
}
