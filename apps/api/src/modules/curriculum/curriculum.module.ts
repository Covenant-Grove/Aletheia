import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { CurriculumRepository } from './infrastructure/curriculum.repository.js';
import { ObjectiveRepository } from './infrastructure/objective.repository.js';
import { CurriculumTemplateEngine } from './infrastructure/curriculum-template.engine.js';
import { PedagogicalModelDefinitionResolver } from './infrastructure/pedagogical-model-definition.resolver.js';
import { PedagogicalModelDefinitionSeeder } from './infrastructure/pedagogical-model-definition.seeder.js';
import { EvidenceTypeDefinitionSeeder } from './infrastructure/evidence-type-definition.seeder.js';
import { DefinitionsRepository } from './infrastructure/definitions.repository.js';
import { ProfilesRepository } from './infrastructure/profiles.repository.js';
import { EvidenceSubmissionRepository } from './infrastructure/evidence-submission.repository.js';
import { CurriculumService } from './application/curriculum.service.js';
import { ObjectiveService } from './application/objective.service.js';
import { DefinitionsService } from './application/definitions.service.js';
import { ProfilesService } from './application/profiles.service.js';
import { EvidenceSubmissionService } from './application/evidence-submission.service.js';
import { CURRICULUM_PUBLIC_API } from './application/public-api.js';
import { CurriculumController } from './presentation/curriculum.controller.js';
import { ObjectiveController } from './presentation/objective.controller.js';
import { DefinitionsController } from './presentation/definitions.controller.js';
import { ProfilesController } from './presentation/profiles.controller.js';
import { EvidenceSubmissionController } from './presentation/evidence-submission.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CurriculumController,
    ObjectiveController,
    DefinitionsController,
    ProfilesController,
    EvidenceSubmissionController,
  ],
  providers: [
    CurriculumRepository,
    ObjectiveRepository,
    CurriculumTemplateEngine,
    PedagogicalModelDefinitionResolver,
    PedagogicalModelDefinitionSeeder,
    EvidenceTypeDefinitionSeeder,
    DefinitionsRepository,
    ProfilesRepository,
    EvidenceSubmissionRepository,
    CurriculumService,
    ObjectiveService,
    DefinitionsService,
    ProfilesService,
    EvidenceSubmissionService,
    {
      provide: CURRICULUM_PUBLIC_API,
      useExisting: CurriculumService,
    },
  ],
  exports: [CURRICULUM_PUBLIC_API, CurriculumService, ObjectiveService],
})
export class CurriculumModule {}
