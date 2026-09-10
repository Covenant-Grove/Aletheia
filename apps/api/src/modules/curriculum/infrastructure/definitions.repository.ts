import { Injectable } from '@nestjs/common';
import type {
  LearningDomain,
  CompetencyDefinition,
  PedagogicalModelDefinition,
  LearningPath,
  SkillDefinition,
  Prisma,
} from '@prisma/client';
import type {
  CreateLearningDomainOutput,
  CreateCompetencyDefinitionOutput,
  CreatePedagogicalModelDefinitionOutput,
  CreateLearningPathOutput,
  CreateSkillDefinitionOutput,
} from '@aletheia/contracts';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import type { DefinitionStatusUpdate } from '../application/definition-status-transition.js';

// Thin CRUD for the Definition/Version tables added across #97/#98/#99
// (LearningDomain, CompetencyDefinition, PedagogicalModelDefinition,
// LearningPath, SkillDefinition). No business logic here beyond straight
// Prisma calls -- status-transition validation lives in
// definition-status-transition.ts and is applied by the service layer.
@Injectable()
export class DefinitionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Learning Domain
  createLearningDomain(dto: CreateLearningDomainOutput): Promise<LearningDomain> {
    return this.prisma.learningDomain.create({
      data: {
        code: dto.code,
        version: dto.version,
        status: dto.status,
        schemaVersion: dto.schemaVersion,
        name: dto.name,
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  listLearningDomains(): Promise<LearningDomain[]> {
    return this.prisma.learningDomain.findMany({ orderBy: [{ code: 'asc' }, { version: 'desc' }] });
  }

  findLearningDomainById(id: string): Promise<LearningDomain | null> {
    return this.prisma.learningDomain.findUnique({ where: { id } });
  }

  updateLearningDomainStatus(id: string, update: DefinitionStatusUpdate): Promise<LearningDomain> {
    return this.prisma.learningDomain.update({ where: { id }, data: update });
  }

  // Competency Definition
  createCompetencyDefinition(dto: CreateCompetencyDefinitionOutput): Promise<CompetencyDefinition> {
    return this.prisma.competencyDefinition.create({
      data: {
        code: dto.code,
        version: dto.version,
        status: dto.status,
        schemaVersion: dto.schemaVersion,
        domainId: dto.domainId,
        pathId: dto.pathId ?? null,
        title: dto.title,
        level: dto.level ?? null,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  listCompetencyDefinitions(): Promise<CompetencyDefinition[]> {
    return this.prisma.competencyDefinition.findMany({ orderBy: [{ code: 'asc' }, { version: 'desc' }] });
  }

  findCompetencyDefinitionById(id: string): Promise<CompetencyDefinition | null> {
    return this.prisma.competencyDefinition.findUnique({ where: { id } });
  }

  updateCompetencyDefinitionStatus(id: string, update: DefinitionStatusUpdate): Promise<CompetencyDefinition> {
    return this.prisma.competencyDefinition.update({ where: { id }, data: update });
  }

  // Pedagogical Model Definition
  createPedagogicalModelDefinition(
    dto: CreatePedagogicalModelDefinitionOutput,
  ): Promise<PedagogicalModelDefinition> {
    return this.prisma.pedagogicalModelDefinition.create({
      data: {
        code: dto.code,
        version: dto.version,
        status: dto.status,
        schemaVersion: dto.schemaVersion,
        name: dto.name,
        description: dto.description ?? null,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  listPedagogicalModelDefinitions(): Promise<PedagogicalModelDefinition[]> {
    return this.prisma.pedagogicalModelDefinition.findMany({ orderBy: [{ code: 'asc' }, { version: 'desc' }] });
  }

  findPedagogicalModelDefinitionById(id: string): Promise<PedagogicalModelDefinition | null> {
    return this.prisma.pedagogicalModelDefinition.findUnique({ where: { id } });
  }

  updatePedagogicalModelDefinitionStatus(
    id: string,
    update: DefinitionStatusUpdate,
  ): Promise<PedagogicalModelDefinition> {
    return this.prisma.pedagogicalModelDefinition.update({ where: { id }, data: update });
  }

  // Learning Path
  createLearningPath(dto: CreateLearningPathOutput): Promise<LearningPath> {
    return this.prisma.learningPath.create({
      data: {
        code: dto.code,
        version: dto.version,
        status: dto.status,
        schemaVersion: dto.schemaVersion,
        domainId: dto.domainId,
        name: dto.name,
        description: dto.description ?? null,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  listLearningPaths(): Promise<LearningPath[]> {
    return this.prisma.learningPath.findMany({ orderBy: [{ code: 'asc' }, { version: 'desc' }] });
  }

  findLearningPathById(id: string): Promise<LearningPath | null> {
    return this.prisma.learningPath.findUnique({ where: { id } });
  }

  updateLearningPathStatus(id: string, update: DefinitionStatusUpdate): Promise<LearningPath> {
    return this.prisma.learningPath.update({ where: { id }, data: update });
  }

  // Skill Definition
  createSkillDefinition(dto: CreateSkillDefinitionOutput): Promise<SkillDefinition> {
    return this.prisma.skillDefinition.create({
      data: {
        code: dto.code,
        version: dto.version,
        status: dto.status,
        schemaVersion: dto.schemaVersion,
        competencyId: dto.competencyId,
        title: dto.title,
        order: dto.order,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  listSkillDefinitions(): Promise<SkillDefinition[]> {
    return this.prisma.skillDefinition.findMany({ orderBy: [{ code: 'asc' }, { version: 'desc' }] });
  }

  findSkillDefinitionById(id: string): Promise<SkillDefinition | null> {
    return this.prisma.skillDefinition.findUnique({ where: { id } });
  }

  updateSkillDefinitionStatus(id: string, update: DefinitionStatusUpdate): Promise<SkillDefinition> {
    return this.prisma.skillDefinition.update({ where: { id }, data: update });
  }
}
