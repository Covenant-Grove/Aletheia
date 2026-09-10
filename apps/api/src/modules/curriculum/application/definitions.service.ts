import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  LearningDomain,
  CompetencyDefinition,
  PedagogicalModelDefinition,
  LearningPath,
  SkillDefinition,
} from '@prisma/client';
import type {
  CreateLearningDomainOutput,
  LearningDomainResponseDto,
  CreateCompetencyDefinitionOutput,
  CompetencyDefinitionResponseDto,
  CreatePedagogicalModelDefinitionOutput,
  PedagogicalModelDefinitionResponseDto,
  CreateLearningPathOutput,
  LearningPathResponseDto,
  CreateSkillDefinitionOutput,
  SkillDefinitionResponseDto,
  DefinitionStatus,
} from '@aletheia/contracts';
import { DefinitionsRepository } from '../infrastructure/definitions.repository.js';
import { computeStatusTransition } from './definition-status-transition.js';

// Admin CRUD for the data-driven curriculum foundation (issue #96 Fase 0,
// "test from section 40": adding a new domain/competency/track/skill/
// pedagogical model should be a data write through this API, not a code
// change + deploy. DRAFT -> PUBLISHED -> DEPRECATED -> ARCHIVED transitions
// are explicit calls (see definition-status-transition.ts), never an
// implicit side effect of create/update.
//
// Deliberately NOT wired into any learner-facing read path -- CurriculumService
// still resolves pedagogical frameworks via the pre-existing enum +
// CurriculumTemplateEngine switch-case. That cutover is a separate,
// human-approved PR.
@Injectable()
export class DefinitionsService {
  constructor(private readonly repository: DefinitionsRepository) {}

  // Learning Domain
  async createLearningDomain(dto: CreateLearningDomainOutput): Promise<LearningDomainResponseDto> {
    const row = await this.repository.createLearningDomain(dto);
    return this.toLearningDomainDto(row);
  }

  async listLearningDomains(): Promise<LearningDomainResponseDto[]> {
    const rows = await this.repository.listLearningDomains();
    return rows.map((row) => this.toLearningDomainDto(row));
  }

  async transitionLearningDomainStatus(id: string, status: DefinitionStatus): Promise<LearningDomainResponseDto> {
    const existing = await this.repository.findLearningDomainById(id);
    if (!existing) throw new NotFoundException('Learning domain not found.');
    const update = computeStatusTransition(existing.status as DefinitionStatus, status);
    const row = await this.repository.updateLearningDomainStatus(id, update);
    return this.toLearningDomainDto(row);
  }

  // Competency Definition
  async createCompetencyDefinition(dto: CreateCompetencyDefinitionOutput): Promise<CompetencyDefinitionResponseDto> {
    const row = await this.repository.createCompetencyDefinition(dto);
    return this.toCompetencyDefinitionDto(row);
  }

  async listCompetencyDefinitions(): Promise<CompetencyDefinitionResponseDto[]> {
    const rows = await this.repository.listCompetencyDefinitions();
    return rows.map((row) => this.toCompetencyDefinitionDto(row));
  }

  async transitionCompetencyDefinitionStatus(
    id: string,
    status: DefinitionStatus,
  ): Promise<CompetencyDefinitionResponseDto> {
    const existing = await this.repository.findCompetencyDefinitionById(id);
    if (!existing) throw new NotFoundException('Competency definition not found.');
    const update = computeStatusTransition(existing.status as DefinitionStatus, status);
    const row = await this.repository.updateCompetencyDefinitionStatus(id, update);
    return this.toCompetencyDefinitionDto(row);
  }

  // Pedagogical Model Definition
  async createPedagogicalModelDefinition(
    dto: CreatePedagogicalModelDefinitionOutput,
  ): Promise<PedagogicalModelDefinitionResponseDto> {
    const row = await this.repository.createPedagogicalModelDefinition(dto);
    return this.toPedagogicalModelDefinitionDto(row);
  }

  async listPedagogicalModelDefinitions(): Promise<PedagogicalModelDefinitionResponseDto[]> {
    const rows = await this.repository.listPedagogicalModelDefinitions();
    return rows.map((row) => this.toPedagogicalModelDefinitionDto(row));
  }

  async transitionPedagogicalModelDefinitionStatus(
    id: string,
    status: DefinitionStatus,
  ): Promise<PedagogicalModelDefinitionResponseDto> {
    const existing = await this.repository.findPedagogicalModelDefinitionById(id);
    if (!existing) throw new NotFoundException('Pedagogical model definition not found.');
    const update = computeStatusTransition(existing.status as DefinitionStatus, status);
    const row = await this.repository.updatePedagogicalModelDefinitionStatus(id, update);
    return this.toPedagogicalModelDefinitionDto(row);
  }

  // Learning Path
  async createLearningPath(dto: CreateLearningPathOutput): Promise<LearningPathResponseDto> {
    const row = await this.repository.createLearningPath(dto);
    return this.toLearningPathDto(row);
  }

  async listLearningPaths(): Promise<LearningPathResponseDto[]> {
    const rows = await this.repository.listLearningPaths();
    return rows.map((row) => this.toLearningPathDto(row));
  }

  async transitionLearningPathStatus(id: string, status: DefinitionStatus): Promise<LearningPathResponseDto> {
    const existing = await this.repository.findLearningPathById(id);
    if (!existing) throw new NotFoundException('Learning path not found.');
    const update = computeStatusTransition(existing.status as DefinitionStatus, status);
    const row = await this.repository.updateLearningPathStatus(id, update);
    return this.toLearningPathDto(row);
  }

  // Skill Definition
  async createSkillDefinition(dto: CreateSkillDefinitionOutput): Promise<SkillDefinitionResponseDto> {
    const row = await this.repository.createSkillDefinition(dto);
    return this.toSkillDefinitionDto(row);
  }

  async listSkillDefinitions(): Promise<SkillDefinitionResponseDto[]> {
    const rows = await this.repository.listSkillDefinitions();
    return rows.map((row) => this.toSkillDefinitionDto(row));
  }

  async transitionSkillDefinitionStatus(id: string, status: DefinitionStatus): Promise<SkillDefinitionResponseDto> {
    const existing = await this.repository.findSkillDefinitionById(id);
    if (!existing) throw new NotFoundException('Skill definition not found.');
    const update = computeStatusTransition(existing.status as DefinitionStatus, status);
    const row = await this.repository.updateSkillDefinitionStatus(id, update);
    return this.toSkillDefinitionDto(row);
  }

  // Mappers
  private toLearningDomainDto(row: LearningDomain): LearningDomainResponseDto {
    return {
      id: row.id,
      code: row.code,
      version: row.version,
      status: row.status as DefinitionStatus,
      schemaVersion: row.schemaVersion,
      name: row.name,
      description: row.description,
      parentId: row.parentId,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      deprecatedAt: row.deprecatedAt ? row.deprecatedAt.toISOString() : null,
    };
  }

  private toCompetencyDefinitionDto(row: CompetencyDefinition): CompetencyDefinitionResponseDto {
    return {
      id: row.id,
      code: row.code,
      version: row.version,
      status: row.status as DefinitionStatus,
      schemaVersion: row.schemaVersion,
      domainId: row.domainId,
      pathId: row.pathId,
      title: row.title,
      level: row.level,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      deprecatedAt: row.deprecatedAt ? row.deprecatedAt.toISOString() : null,
    };
  }

  private toPedagogicalModelDefinitionDto(row: PedagogicalModelDefinition): PedagogicalModelDefinitionResponseDto {
    return {
      id: row.id,
      code: row.code,
      version: row.version,
      status: row.status as DefinitionStatus,
      schemaVersion: row.schemaVersion,
      name: row.name,
      description: row.description,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      deprecatedAt: row.deprecatedAt ? row.deprecatedAt.toISOString() : null,
    };
  }

  private toLearningPathDto(row: LearningPath): LearningPathResponseDto {
    return {
      id: row.id,
      code: row.code,
      version: row.version,
      status: row.status as DefinitionStatus,
      schemaVersion: row.schemaVersion,
      domainId: row.domainId,
      name: row.name,
      description: row.description,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      deprecatedAt: row.deprecatedAt ? row.deprecatedAt.toISOString() : null,
    };
  }

  private toSkillDefinitionDto(row: SkillDefinition): SkillDefinitionResponseDto {
    return {
      id: row.id,
      code: row.code,
      version: row.version,
      status: row.status as DefinitionStatus,
      schemaVersion: row.schemaVersion,
      competencyId: row.competencyId,
      title: row.title,
      order: row.order,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      deprecatedAt: row.deprecatedAt ? row.deprecatedAt.toISOString() : null,
    };
  }
}
