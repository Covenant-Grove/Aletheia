import { Injectable } from '@nestjs/common';
import type {
  CreateNotificationDto,
  FamilySettingsResponseDto,
  NotificationItemResponseDto,
  NotificationType,
  UpdateFamilySettingsDto,
} from '@aletheia/contracts';
import { FamilySettingsRepository } from '../infrastructure/family-settings.repository.js';
import { NotificationService } from './notification.service.js';

@Injectable()
export class FamilySettingsService {
  constructor(
    private readonly settingsRepository: FamilySettingsRepository,
    private readonly notificationService: NotificationService,
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
  async createNotification(
    familyId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationItemResponseDto> {
    return this.notificationService.createNotification(familyId, dto);
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
