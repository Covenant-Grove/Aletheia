import { Injectable } from '@nestjs/common';
import type { TemplateSubjectDefinition } from '@aletheia/contracts';
import { pedagogicalModelMetadataSchema } from '@aletheia/contracts';
import { PrismaService } from '../../../platform/database/prisma.service.js';

// Generic resolver reading pedagogical model content from data instead of a
// switch-case (issue #96, Fase 0). Given a framework `code`, it returns the
// same `TemplateSubjectDefinition[]` shape `CurriculumTemplateEngine`
// returns -- this resolver knows nothing about "Montessori" or "Charlotte
// Mason" by name; it only knows how to look up a PUBLISHED definition by
// code and parse its `metadata`. Coexists with (does not replace) the old
// engine in this phase.
@Injectable()
export class PedagogicalModelDefinitionResolver {
  constructor(private readonly prisma: PrismaService) {}

  async getSubjectDefinitions(code: string): Promise<TemplateSubjectDefinition[]> {
    const row = await this.prisma.pedagogicalModelDefinition.findFirst({
      where: { code, status: 'PUBLISHED' },
      orderBy: { version: 'desc' },
    });

    if (!row) return [];

    return pedagogicalModelMetadataSchema.parse(row.metadata).subjects;
  }
}
