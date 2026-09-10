import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  CreateNotificationDto,
  FamilySettingsResponseDto,
  NotificationItemResponseDto,
  NotificationType,
  UpdateFamilySettingsDto,
} from '@aletheia/contracts';
import { FamilySettingsRepository } from '../infrastructure/family-settings.repository.js';
import { NotificationService } from './notification.service.js';
import { MAIL_SENDER, type MailSender } from '../../../platform/mail/mail-sender.js';
import {
  IDENTITY_PUBLIC_API,
  type IdentityPublicApi,
} from '../../identity/application/public-api.js';

@Injectable()
export class FamilySettingsService {
  private readonly logger = new Logger(FamilySettingsService.name);

  constructor(
    private readonly settingsRepository: FamilySettingsRepository,
    private readonly notificationService: NotificationService,
    @Inject(MAIL_SENDER)
    private readonly mailSender: MailSender,
    @Inject(IDENTITY_PUBLIC_API)
    private readonly identityApi: IdentityPublicApi,
  ) {}

  async getSettings(familyId: string): Promise<FamilySettingsResponseDto> {
    const settings = await this.settingsRepository.getOrCreateDefault(familyId);
    return settings.toResponseDto();
  }

  async updateSettings(
    familyId: string,
    dto: UpdateFamilySettingsDto,
  ): Promise<FamilySettingsResponseDto> {
    const updated = await this.settingsRepository.upsert(familyId, dto);
    return updated.toResponseDto();
  }

  // Delegates rather than duplicates -- keeps NotificationService as the
  // single owner of notification-creation logic; this just exposes it
  // across the settings/application/public-api.ts boundary other modules
  // are required to go through (enforced by check-module-boundaries.mjs).
  //
  // Also the single place that actually honors inAppNotificationsEnabled /
  // emailNotificationsEnabled -- both used to be saved by the settings form
  // and never read anywhere, so toggling them off did nothing.
  async createNotification(
    familyId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationItemResponseDto | null> {
    const settings = await this.settingsRepository.getOrCreateDefault(familyId);

    let created: NotificationItemResponseDto | null = null;
    if (settings.inAppNotificationsEnabled) {
      created = await this.notificationService.createNotification(familyId, dto);
    }

    if (settings.emailNotificationsEnabled) {
      await this.sendNotificationEmail(dto);
    }

    return created;
  }

  // Best-effort: an email provider outage must never block notification
  // creation (or, when in-app notifications are off, be the only thing that
  // failed silently) -- reuses the notification's own title/message rather
  // than a per-type template, since there's no template system here yet.
  private async sendNotificationEmail(dto: CreateNotificationDto): Promise<void> {
    try {
      const user = await this.identityApi.findUserById(dto.userId);
      if (!user) return;

      await this.mailSender.send({
        to: user.email,
        subject: dto.title,
        text: dto.message,
        html: `<p>${dto.message}</p>`,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send notification email to user ${dto.userId}: ${(error as Error).message}`,
      );
    }
  }

  async wasNotifiedSince(
    familyId: string,
    type: NotificationType,
    since: Date,
  ): Promise<boolean> {
    return this.notificationService.wasNotifiedSince(familyId, type, since);
  }

  async listFamiliesWithRemindersEnabled(): Promise<FamilySettingsResponseDto[]> {
    const settings = await this.settingsRepository.findAllWithRemindersEnabled();
    return settings.map((entity) => entity.toResponseDto());
  }
}
