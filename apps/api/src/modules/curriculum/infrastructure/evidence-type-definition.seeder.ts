import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import { BASE_EVIDENCE_TYPE_SEED_ROWS } from './evidence-type-definition.seed-data.js';

// Upserts the base evidence type rows (issue #96 section 9). Idempotent:
// re-running it updates the PUBLISHED version-1 row in place rather than
// creating duplicates -- same pattern as
// PedagogicalModelDefinitionSeeder.
@Injectable()
export class EvidenceTypeDefinitionSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<number> {
    const now = new Date();

    for (const row of BASE_EVIDENCE_TYPE_SEED_ROWS) {
      await this.prisma.evidenceTypeDefinition.upsert({
        where: { code_version: { code: row.code, version: 1 } },
        create: {
          code: row.code,
          version: 1,
          status: 'PUBLISHED',
          name: row.name,
          description: row.description,
          metadata: row.metadata,
          publishedAt: now,
        },
        update: {
          status: 'PUBLISHED',
          name: row.name,
          description: row.description,
          metadata: row.metadata,
          publishedAt: now,
        },
      });
    }

    return BASE_EVIDENCE_TYPE_SEED_ROWS.length;
  }
}
