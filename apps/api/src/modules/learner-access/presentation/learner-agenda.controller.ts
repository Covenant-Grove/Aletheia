import { Controller, ForbiddenException, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { DailyAgendaDto, LessonPlanResponseDto } from '@aletheia/contracts';
import { LearnerAccessGuard, LearnerSelfGuard } from '../../../platform/auth/index.js';
import {
  SCHEDULE_PUBLIC_API,
  LESSON_PLAN_PUBLIC_API,
  type SchedulePublicApi,
  type LessonPlanPublicApi,
} from '../../lessons/application/public-api.js';

interface RequestWithLearner {
  learner: { learnerId: string; familyId: string };
}

// Restricted surface: today's agenda + mark-complete for the learner's own
// id only. LearnerAccessGuard rejects anything but a valid, still-enabled
// learner session; LearnerSelfGuard rejects any :learnerId route param that
// doesn't match the session's own learnerId.
@ApiTags('Learner Access (learner)')
@UseGuards(LearnerAccessGuard, LearnerSelfGuard)
@Controller({ path: 'learner-access/learners/:learnerId', version: '1' })
export class LearnerAgendaController {
  constructor(
    @Inject(SCHEDULE_PUBLIC_API)
    private readonly scheduleApi: SchedulePublicApi,
    @Inject(LESSON_PLAN_PUBLIC_API)
    private readonly lessonPlanApi: LessonPlanPublicApi,
  ) {}

  @Get('agenda')
  @ApiOperation({ summary: "Get the learner's own daily agenda" })
  @ApiResponse({ status: 200, description: 'Agenda for the requested (or current) date.' })
  async getAgenda(
    @Param() params: { learnerId: string },
    @Query('date') date: string | undefined,
    @Req() request: RequestWithLearner,
  ): Promise<DailyAgendaDto> {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    return this.scheduleApi.getDailyAgenda(request.learner.familyId, targetDate, params.learnerId);
  }

  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Mark one of the learner’s own lessons complete' })
  @ApiResponse({ status: 200, description: 'Lesson marked complete.' })
  @ApiResponse({ status: 403, description: 'The lesson is not assigned to this learner.' })
  async completeLesson(
    @Param() params: { learnerId: string; lessonId: string },
    @Req() request: RequestWithLearner,
  ): Promise<LessonPlanResponseDto> {
    const lesson = await this.lessonPlanApi.getLessonPlan(request.learner.familyId, params.lessonId);
    const isAssignedToLearner = lesson.learners.some((l) => l.learnerId === params.learnerId);
    if (!isAssignedToLearner) {
      throw new ForbiddenException('This lesson is not assigned to you.');
    }

    return this.lessonPlanApi.completeLesson(
      request.learner.familyId,
      params.lessonId,
      {},
      params.learnerId,
    );
  }
}
