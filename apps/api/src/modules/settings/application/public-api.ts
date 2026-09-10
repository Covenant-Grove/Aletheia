import type {
  CreateNotificationDto,
  FamilyDataExportPackageDto,
  FamilySettingsResponseDto,
  NotificationItemResponseDto,
  NotificationType,
} from '@aletheia/contracts';

export const SETTINGS_PUBLIC_API = Symbol('SETTINGS_PUBLIC_API');
export const FAMILY_SETTINGS_PUBLIC_API = SETTINGS_PUBLIC_API;

export interface SettingsPublicApi {
  getSettings(familyId: string): Promise<FamilySettingsResponseDto>;
  // Returns null when the family has disabled in-app notifications --
  // callers that don't need the created row (the common case: reminders
  // and the prayer-answered alert both fire-and-forget) can ignore it.
  createNotification(
    familyId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationItemResponseDto | null>;
  wasNotifiedSince(familyId: string, type: NotificationType, since: Date): Promise<boolean>;
  listFamiliesWithRemindersEnabled(): Promise<FamilySettingsResponseDto[]>;
  exportFamilyData(familyId: string): Promise<FamilyDataExportPackageDto>;
}
