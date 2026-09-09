import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { FamilySettingsResponseDto, NotificationType } from '@aletheia/contracts';
import {
  FAMILY_PUBLIC_API,
  type FamilyPublicApi,
} from '../../families/application/public-api.js';
import {
  SETTINGS_PUBLIC_API,
  type SettingsPublicApi,
} from '../../settings/application/public-api.js';
import {
  LEARNERS_PUBLIC_API,
  type LearnersPublicApi,
} from '../../learners/application/public-api.js';
import {
  COMPLIANCE_REPORTS_PUBLIC_API,
  type ComplianceReportsPublicApi,
} from '../../reports/application/public-api.js';
import { currentLocalTime, startOfLocalDayUtc } from './timezone.util.js';

// No dedicated time field exists for the attendance check (unlike the other
// two reminders) -- fires once daily near the end of a typical school day.
const ATTENDANCE_CHECK_TIME = '19:00';

interface ReminderContent {
  title: string;
  message: string;
  linkUrl: string;
}

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @Inject(SETTINGS_PUBLIC_API)
    private readonly settingsApi: SettingsPublicApi,
    @Inject(FAMILY_PUBLIC_API)
    private readonly familyApi: FamilyPublicApi,
    @Inject(LEARNERS_PUBLIC_API)
    private readonly learnersApi: LearnersPublicApi,
    @Inject(COMPLIANCE_REPORTS_PUBLIC_API)
    private readonly complianceApi: ComplianceReportsPublicApi,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTick(): Promise<void> {
    const now = new Date();
    const families = await this.settingsApi.listFamiliesWithRemindersEnabled();

    await Promise.all(
      families.map((family) =>
        this.processFamily(family, now).catch((error: unknown) => {
          this.logger.warn(
            `Reminder tick failed for family ${family.familyId}: ${(error as Error).message}`,
          );
        }),
      ),
    );
  }

  private async processFamily(settings: FamilySettingsResponseDto, now: Date): Promise<void> {
    const { hhmm, dateKey } = currentLocalTime(now, settings.timezone);
    const startOfDay = startOfLocalDayUtc(now, settings.timezone);

    if (settings.devotionalReminderTime && settings.devotionalReminderTime === hhmm) {
      await this.notifyOnce(settings.familyId, 'DEVOTIONAL_REMINDER', startOfDay, {
        title: 'Hora do devocional',
        message: 'Não esqueça o devocional da família hoje.',
        linkUrl: '/devotional',
      });
    }

    if (settings.dailyScheduleReminderTime && settings.dailyScheduleReminderTime === hhmm) {
      await this.notifyOnce(settings.familyId, 'DAILY_SCHEDULE_REMINDER', startOfDay, {
        title: 'Agenda do dia',
        message: 'Confira a agenda de hoje.',
        linkUrl: '/schedule',
      });
    }

    if (settings.attendanceReminderEnabled && hhmm === ATTENDANCE_CHECK_TIME) {
      await this.checkAttendance(settings.familyId, dateKey, startOfDay);
    }
  }

  private async checkAttendance(
    familyId: string,
    dateKey: string,
    startOfDay: Date,
  ): Promise<void> {
    const learners = await this.learnersApi.listActiveLearners(familyId);
    if (learners.length === 0) return;

    const records = await this.complianceApi.listAttendance(familyId, {
      startDate: dateKey,
      endDate: dateKey,
    });
    if (records.length > 0) return;

    await this.notifyOnce(familyId, 'ATTENDANCE_MISSING_REMINDER', startOfDay, {
      title: 'Presença não registrada',
      message: 'Nenhuma presença foi registrada hoje.',
      linkUrl: '/attendance',
    });
  }

  private async notifyOnce(
    familyId: string,
    type: NotificationType,
    since: Date,
    content: ReminderContent,
  ): Promise<void> {
    const alreadySent = await this.settingsApi.wasNotifiedSince(familyId, type, since);
    if (alreadySent) return;

    const memberUserIds = await this.familyApi.getFamilyMemberUserIds(familyId);
    await Promise.all(
      memberUserIds.map((userId) =>
        this.settingsApi.createNotification(familyId, { userId, type, ...content }),
      ),
    );
  }
}
