import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrayerRepository } from '../infrastructure/prayer.repository.js';
import {
  FAMILY_PUBLIC_API,
  type FamilyPublicApi,
} from '../../families/application/public-api.js';
import { NotificationService } from '../../settings/application/notification.service.js';
import type {
  AnswerPrayerDto,
  CreatePrayerDto,
  PrayerResponseDto,
  UpdatePrayerDto,
} from '@aletheia/contracts';

@Injectable()
export class PrayerService {
  private readonly logger = new Logger(PrayerService.name);

  constructor(
    private readonly prayerRepository: PrayerRepository,
    @Inject(FAMILY_PUBLIC_API)
    private readonly familyApi: FamilyPublicApi,
    private readonly notificationService: NotificationService,
  ) {}

  async createPrayer(familyId: string, dto: CreatePrayerDto): Promise<PrayerResponseDto> {
    const prayer = await this.prayerRepository.create(familyId, dto);
    return prayer.toResponseDto();
  }

  async getFamilyPrayers(
    familyId: string,
    filter?: { isAnswered?: boolean; includeArchived?: boolean },
  ): Promise<PrayerResponseDto[]> {
    const prayers = await this.prayerRepository.findByFamilyId(familyId, filter);
    return prayers.map((prayer) => prayer.toResponseDto());
  }

  async getPrayerById(familyId: string, id: string): Promise<PrayerResponseDto> {
    const prayer = await this.prayerRepository.findByIdAndFamilyId(familyId, id);
    if (!prayer) {
      throw new NotFoundException(`Prayer request not found: ${id}`);
    }
    return prayer.toResponseDto();
  }

  async updatePrayer(
    familyId: string,
    id: string,
    dto: UpdatePrayerDto,
  ): Promise<PrayerResponseDto> {
    const updated = await this.prayerRepository.update(familyId, id, dto);
    if (!updated) {
      throw new NotFoundException(`Prayer request not found: ${id}`);
    }
    return updated.toResponseDto();
  }

  async answerPrayer(
    familyId: string,
    id: string,
    dto: AnswerPrayerDto,
  ): Promise<PrayerResponseDto> {
    const updated = await this.prayerRepository.update(familyId, id, {
      isAnswered: true,
      answeredAt: new Date(),
      answeredNote: dto.answeredNote?.trim() || null,
    });
    if (!updated) {
      throw new NotFoundException(`Prayer request not found: ${id}`);
    }

    await this.notifyPrayerAnswered(familyId, updated);

    return updated.toResponseDto();
  }

  // Best-effort: a notification failure must never undo an already-persisted
  // "answered" status, so this never throws back into answerPrayer.
  private async notifyPrayerAnswered(
    familyId: string,
    prayer: { id: string; title: string },
  ): Promise<void> {
    try {
      const memberUserIds = await this.familyApi.getFamilyMemberUserIds(familyId);
      await Promise.all(
        memberUserIds.map((userId) =>
          this.notificationService.createNotification(familyId, {
            userId,
            type: 'PRAYER_ANSWERED_ALERT',
            title: 'Oração respondida',
            message: `"${prayer.title}" foi marcada como respondida.`,
            linkUrl: '/devotional',
            metadata: { prayerId: prayer.id },
          }),
        ),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to notify family ${familyId} about answered prayer ${prayer.id}: ${(error as Error).message}`,
      );
    }
  }

  async archivePrayer(familyId: string, id: string): Promise<PrayerResponseDto> {
    const updated = await this.prayerRepository.update(familyId, id, {
      archivedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException(`Prayer request not found: ${id}`);
    }
    return updated.toResponseDto();
  }
}
