import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createLearningDomainSchema,
  createCompetencyDefinitionSchema,
  createPedagogicalModelDefinitionSchema,
  createLearningPathSchema,
  createSkillDefinitionSchema,
  transitionDefinitionStatusSchema,
  type CreateLearningDomainOutput,
  type LearningDomainResponseDto,
  type CreateCompetencyDefinitionOutput,
  type CompetencyDefinitionResponseDto,
  type CreatePedagogicalModelDefinitionOutput,
  type PedagogicalModelDefinitionResponseDto,
  type CreateLearningPathOutput,
  type LearningPathResponseDto,
  type CreateSkillDefinitionOutput,
  type SkillDefinitionResponseDto,
  type TransitionDefinitionStatusDto,
} from '@aletheia/contracts';
import { JwtAuthGuard, PlatformAdminGuard } from '../../../platform/auth/index.js';
import { ZodValidationPipe } from '../../../platform/validation/index.js';
import { DefinitionsService } from '../application/definitions.service.js';

// Admin CRUD surface for the data-driven curriculum foundation (issue #96
// Fase 0). Platform-wide, not family-scoped -- gated by the real
// platform-admin role (issue #101, User.isPlatformAdmin), checked via
// PlatformAdminGuard. This replaces the temporary GuardianOnlyGuard PR
// #100 used as a stopgap ("is this user a guardian of any family").
//
// Nothing here is read by any learner-facing request path yet.
@ApiTags('Curriculum Definitions (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller({ path: 'admin/curriculum-definitions', version: '1' })
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  // Learning Domains
  @Post('learning-domains')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a learning domain definition' })
  async createLearningDomain(
    @Body(new ZodValidationPipe(createLearningDomainSchema)) dto: CreateLearningDomainOutput,
  ): Promise<LearningDomainResponseDto> {
    return this.definitionsService.createLearningDomain(dto);
  }

  @Get('learning-domains')
  @ApiOperation({ summary: 'List learning domain definitions' })
  async listLearningDomains(): Promise<LearningDomainResponseDto[]> {
    return this.definitionsService.listLearningDomains();
  }

  @Patch('learning-domains/:id/status')
  @ApiOperation({ summary: 'Transition a learning domain definition status' })
  async transitionLearningDomainStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<LearningDomainResponseDto> {
    return this.definitionsService.transitionLearningDomainStatus(id, dto.status);
  }

  // Competency Definitions
  @Post('competency-definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a competency definition' })
  async createCompetencyDefinition(
    @Body(new ZodValidationPipe(createCompetencyDefinitionSchema)) dto: CreateCompetencyDefinitionOutput,
  ): Promise<CompetencyDefinitionResponseDto> {
    return this.definitionsService.createCompetencyDefinition(dto);
  }

  @Get('competency-definitions')
  @ApiOperation({ summary: 'List competency definitions' })
  async listCompetencyDefinitions(): Promise<CompetencyDefinitionResponseDto[]> {
    return this.definitionsService.listCompetencyDefinitions();
  }

  @Patch('competency-definitions/:id/status')
  @ApiOperation({ summary: 'Transition a competency definition status' })
  async transitionCompetencyDefinitionStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<CompetencyDefinitionResponseDto> {
    return this.definitionsService.transitionCompetencyDefinitionStatus(id, dto.status);
  }

  // Pedagogical Model Definitions
  @Post('pedagogical-model-definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a pedagogical model definition' })
  async createPedagogicalModelDefinition(
    @Body(new ZodValidationPipe(createPedagogicalModelDefinitionSchema)) dto: CreatePedagogicalModelDefinitionOutput,
  ): Promise<PedagogicalModelDefinitionResponseDto> {
    return this.definitionsService.createPedagogicalModelDefinition(dto);
  }

  @Get('pedagogical-model-definitions')
  @ApiOperation({ summary: 'List pedagogical model definitions' })
  async listPedagogicalModelDefinitions(): Promise<PedagogicalModelDefinitionResponseDto[]> {
    return this.definitionsService.listPedagogicalModelDefinitions();
  }

  @Patch('pedagogical-model-definitions/:id/status')
  @ApiOperation({ summary: 'Transition a pedagogical model definition status' })
  async transitionPedagogicalModelDefinitionStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<PedagogicalModelDefinitionResponseDto> {
    return this.definitionsService.transitionPedagogicalModelDefinitionStatus(id, dto.status);
  }

  // Learning Paths
  @Post('learning-paths')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a learning path definition' })
  async createLearningPath(
    @Body(new ZodValidationPipe(createLearningPathSchema)) dto: CreateLearningPathOutput,
  ): Promise<LearningPathResponseDto> {
    return this.definitionsService.createLearningPath(dto);
  }

  @Get('learning-paths')
  @ApiOperation({ summary: 'List learning path definitions' })
  async listLearningPaths(): Promise<LearningPathResponseDto[]> {
    return this.definitionsService.listLearningPaths();
  }

  @Patch('learning-paths/:id/status')
  @ApiOperation({ summary: 'Transition a learning path definition status' })
  async transitionLearningPathStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<LearningPathResponseDto> {
    return this.definitionsService.transitionLearningPathStatus(id, dto.status);
  }

  // Skill Definitions
  @Post('skill-definitions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a skill definition' })
  async createSkillDefinition(
    @Body(new ZodValidationPipe(createSkillDefinitionSchema)) dto: CreateSkillDefinitionOutput,
  ): Promise<SkillDefinitionResponseDto> {
    return this.definitionsService.createSkillDefinition(dto);
  }

  @Get('skill-definitions')
  @ApiOperation({ summary: 'List skill definitions' })
  async listSkillDefinitions(): Promise<SkillDefinitionResponseDto[]> {
    return this.definitionsService.listSkillDefinitions();
  }

  @Patch('skill-definitions/:id/status')
  @ApiOperation({ summary: 'Transition a skill definition status' })
  async transitionSkillDefinitionStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<SkillDefinitionResponseDto> {
    return this.definitionsService.transitionSkillDefinitionStatus(id, dto.status);
  }
}
