import type { CurriculumPackDefinitionType, PortableRef } from '@aletheia/contracts';
import { PrismaService } from '../../../platform/database/prisma.service.js';

// Export-direction serialization for every definition type a curriculum
// pack can bundle (issue #96 Fase 4, section 28, read half). Each
// handler fetches a row by (code, version) and turns it into portable
// content -- scalar fields as-is, and any foreign-key reference
// resolved to a {type, code, version} pointer (never a raw UUID, since
// the receiving database won't have this one's IDs). Import-direction
// handlers (the reverse: content + ref resolver -> a new DRAFT row) are
// a separate follow-up PR.
//
// A plain per-type switch rather than a heavier abstraction -- there are
// exactly 12 known types (CURRICULUM_PACK_DEFINITION_TYPES), and each
// has a genuinely different shape (join tables, embedded child rows,
// nullable FKs), so a shared generic interface would mostly be
// boilerplate around 12 one-off implementations anyway.

export interface DefinitionLookup {
  id: string;
  status: string;
  schemaVersion: string;
}

async function refFromId(
  prisma: PrismaService,
  type: CurriculumPackDefinitionType,
  id: string | null,
): Promise<PortableRef | null> {
  if (!id) return null;
  switch (type) {
    case 'LearningDomain': {
      const row = await prisma.learningDomain.findUnique({ where: { id }, select: { code: true, version: true } });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'CompetencyDefinition': {
      const row = await prisma.competencyDefinition.findUnique({
        where: { id },
        select: { code: true, version: true },
      });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'LearningPath': {
      const row = await prisma.learningPath.findUnique({ where: { id }, select: { code: true, version: true } });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'RubricDefinition': {
      const row = await prisma.rubricDefinition.findUnique({ where: { id }, select: { code: true, version: true } });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'ActivityDefinition': {
      const row = await prisma.activityDefinition.findUnique({
        where: { id },
        select: { code: true, version: true },
      });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'EvidenceTypeDefinition': {
      const row = await prisma.evidenceTypeDefinition.findUnique({
        where: { id },
        select: { code: true, version: true },
      });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'PedagogicalModelDefinition': {
      const row = await prisma.pedagogicalModelDefinition.findUnique({
        where: { id },
        select: { code: true, version: true },
      });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    case 'TheologicalTraditionDefinition': {
      const row = await prisma.theologicalTraditionDefinition.findUnique({
        where: { id },
        select: { code: true, version: true },
      });
      return row ? { type, code: row.code, version: row.version } : null;
    }
    default:
      return null;
  }
}

export async function findDefinitionByCodeVersion(
  prisma: PrismaService,
  type: CurriculumPackDefinitionType,
  code: string,
  version: number,
): Promise<DefinitionLookup | null> {
  switch (type) {
    case 'LearningDomain':
      return prisma.learningDomain.findUnique({ where: { code_version: { code, version } } });
    case 'CompetencyDefinition':
      return prisma.competencyDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'LearningPath':
      return prisma.learningPath.findUnique({ where: { code_version: { code, version } } });
    case 'SkillDefinition':
      return prisma.skillDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'RubricDefinition':
      return prisma.rubricDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'EvidenceTypeDefinition':
      return prisma.evidenceTypeDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'ActivityDefinition':
      return prisma.activityDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'CurriculumDefinition':
      return prisma.curriculumDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'PedagogicalModelDefinition':
      return prisma.pedagogicalModelDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'TheologicalTraditionDefinition':
      return prisma.theologicalTraditionDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'TheologicalPositionDefinition':
      return prisma.theologicalPositionDefinition.findUnique({ where: { code_version: { code, version } } });
    case 'BibleTranslationDefinition':
      return prisma.bibleTranslationDefinition.findUnique({ where: { code_version: { code, version } } });
    default:
      return null;
  }
}

export async function exportDefinitionContent(
  prisma: PrismaService,
  type: CurriculumPackDefinitionType,
  code: string,
  version: number,
): Promise<Record<string, unknown> | null> {
  switch (type) {
    case 'LearningDomain': {
      const row = await prisma.learningDomain.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return {
        name: row.name,
        description: row.description,
        parentRef: await refFromId(prisma, 'LearningDomain', row.parentId),
        metadata: row.metadata,
      };
    }
    case 'CompetencyDefinition': {
      const row = await prisma.competencyDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return {
        title: row.title,
        level: row.level,
        domainRef: await refFromId(prisma, 'LearningDomain', row.domainId),
        pathRef: await refFromId(prisma, 'LearningPath', row.pathId),
        metadata: row.metadata,
      };
    }
    case 'LearningPath': {
      const row = await prisma.learningPath.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return {
        name: row.name,
        description: row.description,
        domainRef: await refFromId(prisma, 'LearningDomain', row.domainId),
        metadata: row.metadata,
      };
    }
    case 'SkillDefinition': {
      const row = await prisma.skillDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return {
        title: row.title,
        order: row.order,
        competencyRef: await refFromId(prisma, 'CompetencyDefinition', row.competencyId),
        metadata: row.metadata,
      };
    }
    case 'RubricDefinition': {
      const row = await prisma.rubricDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      const criteria = await prisma.rubricCriterion.findMany({ where: { rubricId: row.id }, orderBy: { order: 'asc' } });
      return {
        name: row.name,
        description: row.description,
        competencyRef: await refFromId(prisma, 'CompetencyDefinition', row.competencyId),
        criteria: criteria.map((c) => ({
          code: c.code,
          label: c.label,
          weight: c.weight,
          order: c.order,
          scaleMin: c.scaleMin,
          scaleMax: c.scaleMax,
          metadata: c.metadata,
        })),
        metadata: row.metadata,
      };
    }
    case 'EvidenceTypeDefinition': {
      const row = await prisma.evidenceTypeDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return { name: row.name, description: row.description, metadata: row.metadata };
    }
    case 'ActivityDefinition': {
      const row = await prisma.activityDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      const competencyLinks = await prisma.activityDefinitionCompetency.findMany({ where: { activityId: row.id } });
      const evidenceLinks = await prisma.activityDefinitionEvidenceType.findMany({ where: { activityId: row.id } });
      return {
        name: row.name,
        description: row.description,
        ageMin: row.ageMin,
        ageMax: row.ageMax,
        estimatedDurationMinutes: row.estimatedDurationMinutes,
        supervisionRequired: row.supervisionRequired,
        riskLevel: row.riskLevel,
        evidenceRequirementMode: row.evidenceRequirementMode,
        competencyLinks: await Promise.all(
          competencyLinks.map(async (link) => ({
            ref: await refFromId(prisma, 'CompetencyDefinition', link.competencyId),
            required: link.required,
            order: link.order,
          })),
        ),
        evidenceTypeLinks: await Promise.all(
          evidenceLinks.map(async (link) => ({
            ref: await refFromId(prisma, 'EvidenceTypeDefinition', link.evidenceTypeId),
          })),
        ),
        metadata: row.metadata,
      };
    }
    case 'CurriculumDefinition': {
      const row = await prisma.curriculumDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      const [domainLinks, competencyLinks, rubricLinks, activityLinks] = await Promise.all([
        prisma.curriculumDefinitionDomain.findMany({ where: { curriculumDefinitionId: row.id } }),
        prisma.curriculumDefinitionCompetency.findMany({ where: { curriculumDefinitionId: row.id } }),
        prisma.curriculumDefinitionRubric.findMany({ where: { curriculumDefinitionId: row.id } }),
        prisma.curriculumDefinitionActivity.findMany({ where: { curriculumDefinitionId: row.id } }),
      ]);
      return {
        name: row.name,
        description: row.description,
        pedagogicalModelRef: await refFromId(prisma, 'PedagogicalModelDefinition', row.pedagogicalModelDefinitionId),
        domainLinks: await Promise.all(
          domainLinks.map(async (l) => ({
            ref: await refFromId(prisma, 'LearningDomain', l.domainId),
            required: l.required,
            order: l.order,
          })),
        ),
        competencyLinks: await Promise.all(
          competencyLinks.map(async (l) => ({
            ref: await refFromId(prisma, 'CompetencyDefinition', l.competencyId),
            required: l.required,
            order: l.order,
          })),
        ),
        rubricLinks: await Promise.all(
          rubricLinks.map(async (l) => ({ ref: await refFromId(prisma, 'RubricDefinition', l.rubricId) })),
        ),
        activityLinks: await Promise.all(
          activityLinks.map(async (l) => ({
            ref: await refFromId(prisma, 'ActivityDefinition', l.activityId),
            required: l.required,
            order: l.order,
          })),
        ),
        metadata: row.metadata,
      };
    }
    case 'PedagogicalModelDefinition': {
      const row = await prisma.pedagogicalModelDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return { name: row.name, description: row.description, metadata: row.metadata };
    }
    case 'TheologicalTraditionDefinition': {
      const row = await prisma.theologicalTraditionDefinition.findUnique({
        where: { code_version: { code, version } },
      });
      if (!row) return null;
      return { name: row.name, description: row.description, metadata: row.metadata };
    }
    case 'TheologicalPositionDefinition': {
      const row = await prisma.theologicalPositionDefinition.findUnique({
        where: { code_version: { code, version } },
      });
      if (!row) return null;
      return {
        name: row.name,
        description: row.description,
        topic: row.topic,
        traditionRef: await refFromId(prisma, 'TheologicalTraditionDefinition', row.traditionId),
        metadata: row.metadata,
      };
    }
    case 'BibleTranslationDefinition': {
      const row = await prisma.bibleTranslationDefinition.findUnique({ where: { code_version: { code, version } } });
      if (!row) return null;
      return {
        name: row.name,
        language: row.language,
        youVersionId: row.youVersionId,
        translationPhilosophy: row.translationPhilosophy,
        publisher: row.publisher,
        licensingNotes: row.licensingNotes,
        metadata: row.metadata,
      };
    }
    default:
      return null;
  }
}
