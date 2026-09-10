import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { CurriculumRepository } from './infrastructure/curriculum.repository.js';
import { ObjectiveRepository } from './infrastructure/objective.repository.js';
import { CurriculumTemplateEngine } from './infrastructure/curriculum-template.engine.js';
import { PedagogicalModelDefinitionResolver } from './infrastructure/pedagogical-model-definition.resolver.js';
import { PedagogicalModelDefinitionSeeder } from './infrastructure/pedagogical-model-definition.seeder.js';
import { DefinitionsRepository } from './infrastructure/definitions.repository.js';
import { CurriculumService } from './application/curriculum.service.js';
import { ObjectiveService } from './application/objective.service.js';
import { DefinitionsService } from './application/definitions.service.js';
import { CURRICULUM_PUBLIC_API } from './application/public-api.js';
import { CurriculumController } from './presentation/curriculum.controller.js';
import { ObjectiveController } from './presentation/objective.controller.js';
import { DefinitionsController } from './presentation/definitions.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [CurriculumController, ObjectiveController, DefinitionsController],
  providers: [
    CurriculumRepository,
    ObjectiveRepository,
    CurriculumTemplateEngine,
    PedagogicalModelDefinitionResolver,
    PedagogicalModelDefinitionSeeder,
    DefinitionsRepository,
    CurriculumService,
    ObjectiveService,
    DefinitionsService,
    {
      provide: CURRICULUM_PUBLIC_API,
      useExisting: CurriculumService,
    },
  ],
  exports: [CURRICULUM_PUBLIC_API, CurriculumService, ObjectiveService],
})
export class CurriculumModule {}
