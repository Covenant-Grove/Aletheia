import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createCurriculumPackSchema,
  addCurriculumPackItemSchema,
  addCurriculumPackDependencySchema,
  transitionDefinitionStatusSchema,
  type CreateCurriculumPackOutput,
  type CurriculumPackResponseDto,
  type AddCurriculumPackItemOutput,
  type CurriculumPackItemResponseDto,
  type AddCurriculumPackDependencyOutput,
  type CurriculumPackDependencyResponseDto,
  type TransitionDefinitionStatusDto,
  type CurriculumPackExportDocument,
} from '@aletheia/contracts';
import { JwtAuthGuard, PlatformAdminGuard } from '../../../platform/auth/index.js';
import { ZodValidationPipe } from '../../../platform/validation/index.js';
import { CurriculumPackService } from '../application/curriculum-pack.service.js';
import { CurriculumPackExportService } from '../application/curriculum-pack-export.service.js';

// Admin CRUD for CurriculumPack + manifest + dependencies (issue #96
// Fase 4, section 27), plus export (section 28, read half). Platform-
// wide, not family-scoped -- same PlatformAdminGuard as
// DefinitionsController. Import (section 28, write half) is a separate
// follow-up PR.
@ApiTags('Curriculum Packs (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller({ path: 'admin/curriculum-packs', version: '1' })
export class CurriculumPackController {
  constructor(
    private readonly packService: CurriculumPackService,
    private readonly exportService: CurriculumPackExportService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a curriculum pack' })
  async createPack(
    @Body(new ZodValidationPipe(createCurriculumPackSchema)) dto: CreateCurriculumPackOutput,
  ): Promise<CurriculumPackResponseDto> {
    return this.packService.createPack(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List curriculum packs' })
  async listPacks(): Promise<CurriculumPackResponseDto[]> {
    return this.packService.listPacks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one curriculum pack' })
  async getPack(@Param('id') id: string): Promise<CurriculumPackResponseDto> {
    return this.packService.getPack(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition a curriculum pack status' })
  async transitionPackStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(transitionDefinitionStatusSchema)) dto: TransitionDefinitionStatusDto,
  ): Promise<CurriculumPackResponseDto> {
    return this.packService.transitionPackStatus(id, dto.status);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a definition to a pack manifest' })
  async addItem(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addCurriculumPackItemSchema)) dto: AddCurriculumPackItemOutput,
  ): Promise<CurriculumPackItemResponseDto> {
    return this.packService.addItem(id, dto);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'List a pack manifest' })
  async listItems(@Param('id') id: string): Promise<CurriculumPackItemResponseDto[]> {
    return this.packService.listItems(id);
  }

  @Post(':id/dependencies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a pack-level dependency' })
  async addDependency(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addCurriculumPackDependencySchema)) dto: AddCurriculumPackDependencyOutput,
  ): Promise<CurriculumPackDependencyResponseDto> {
    return this.packService.addDependency(id, dto);
  }

  @Get(':id/dependencies')
  @ApiOperation({ summary: 'List a pack\'s dependencies' })
  async listDependencies(@Param('id') id: string): Promise<CurriculumPackDependencyResponseDto[]> {
    return this.packService.listDependencies(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export a PUBLISHED pack as a portable JSON document' })
  async exportPack(@Param('id') id: string): Promise<CurriculumPackExportDocument> {
    return this.exportService.exportPack(id);
  }
}
