import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { LearnerAccessCodeDto, LearnerAccessGrantDto } from '@aletheia/contracts';
import { JwtAuthGuard, FamilyTenantGuard, CurrentUser } from '../../../platform/auth/index.js';
import { LearnerAccessService } from '../application/learner-access.service.js';

// Guardian-facing: relies entirely on JwtAuthGuard + FamilyTenantGuard for
// authorization, same as every other learner-management action -- this
// module invents no new guardian authorization of its own.
@ApiTags('Learner Access (guardian)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, FamilyTenantGuard)
@Controller({ path: 'families/:familyId/learners/:learnerId/access', version: '1' })
export class LearnerAccessAdminController {
  constructor(private readonly learnerAccessService: LearnerAccessService) {}

  @Get()
  @ApiOperation({ summary: "Get a learner's access-grant status" })
  @ApiResponse({ status: 200, description: 'Grant status (never includes the code).' })
  async getStatus(
    @Param('familyId') familyId: string,
    @Param('learnerId') learnerId: string,
  ): Promise<LearnerAccessGrantDto> {
    return this.learnerAccessService.getGrantStatus(familyId, learnerId);
  }

  @Post('grant')
  @ApiOperation({ summary: 'Enable learner access and issue a new access code' })
  @ApiResponse({ status: 201, description: 'The plaintext code, shown once.' })
  async grant(
    @Param('familyId') familyId: string,
    @Param('learnerId') learnerId: string,
    @CurrentUser('userId') guardianUserId: string,
  ): Promise<LearnerAccessCodeDto> {
    return this.learnerAccessService.grantAccess(familyId, learnerId, guardianUserId);
  }

  @Post('regenerate')
  @ApiOperation({ summary: "Regenerate a learner's access code" })
  @ApiResponse({ status: 201, description: 'The new plaintext code, shown once.' })
  async regenerate(
    @Param('familyId') familyId: string,
    @Param('learnerId') learnerId: string,
    @CurrentUser('userId') guardianUserId: string,
  ): Promise<LearnerAccessCodeDto> {
    return this.learnerAccessService.regenerateCode(familyId, learnerId, guardianUserId);
  }

  @Patch('revoke')
  @ApiOperation({ summary: 'Disable learner access without deleting the code' })
  @ApiResponse({ status: 200, description: 'Grant is now disabled.' })
  async revoke(
    @Param('familyId') familyId: string,
    @Param('learnerId') learnerId: string,
  ): Promise<LearnerAccessGrantDto> {
    return this.learnerAccessService.setEnabled(familyId, learnerId, false);
  }

  @Patch('enable')
  @ApiOperation({ summary: 'Re-enable a previously revoked learner access grant' })
  @ApiResponse({ status: 200, description: 'Grant is now enabled.' })
  async enable(
    @Param('familyId') familyId: string,
    @Param('learnerId') learnerId: string,
  ): Promise<LearnerAccessGrantDto> {
    return this.learnerAccessService.setEnabled(familyId, learnerId, true);
  }
}
