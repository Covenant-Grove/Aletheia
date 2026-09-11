import { Injectable } from '@nestjs/common';
import type { TemplateSubjectDefinition } from '@aletheia/contracts';
import { pedagogicalModelMetadataSchema } from '@aletheia/contracts';
import { PrismaService } from '../../../platform/database/prisma.service.js';

export interface PublishedPedagogicalModel {
  id: string;
  subjects: TemplateSubjectDefinition[];
}

@Injectable()
export class PedagogicalModelDefinitionResolver {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePublished(code: string): Promise<PublishedPedagogicalModel | null> {
    const row = await this.prisma.pedagogicalModelDefinition.findFirst({
      where: { code, status: 'PUBLISHED' },
      orderBy: { version: 'desc' },
    });

    if (!row) return null;

    return { id: row.id, subjects: pedagogicalModelMetadataSchema.parse(row.metadata).subjects };
  }
  async getSubjectDefinitions(code: string): Promise<TemplateSubjectDefinition[]> {
    return (await this.resolvePublished(code))?.subjects ?? [];
  }
}
