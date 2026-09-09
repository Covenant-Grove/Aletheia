import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/database/prisma.service.js';
import { LearnerAccessGrantEntity } from '../domain/learner-access-grant.entity.js';

interface LearnerAccessGrantDbRecord {
  id: string;
  learnerId: string;
  familyId: string;
  codeHash: string;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  regeneratedAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
}

@Injectable()
export class LearnerAccessGrantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLearnerId(learnerId: string): Promise<LearnerAccessGrantEntity | null> {
    const record = await this.prisma.learnerAccessGrant.findUnique({
      where: { learnerId },
    });
    return record ? this.mapToEntity(record as LearnerAccessGrantDbRecord) : null;
  }

  async findEnabledByFamilyId(familyId: string): Promise<LearnerAccessGrantEntity[]> {
    const records = await this.prisma.learnerAccessGrant.findMany({
      where: { familyId, enabled: true },
    });
    return records.map((record) => this.mapToEntity(record as LearnerAccessGrantDbRecord));
  }

  // One row per learner: creates it on first grant, replaces the code and
  // re-enables it on every subsequent grant/regenerate call.
  async upsertForLearner(params: {
    learnerId: string;
    familyId: string;
    codeHash: string;
    createdBy: string;
    isRegeneration: boolean;
  }): Promise<LearnerAccessGrantEntity> {
    const now = new Date();
    const record = await this.prisma.learnerAccessGrant.upsert({
      where: { learnerId: params.learnerId },
      create: {
        learnerId: params.learnerId,
        familyId: params.familyId,
        codeHash: params.codeHash,
        enabled: true,
        createdBy: params.createdBy,
      },
      update: {
        codeHash: params.codeHash,
        enabled: true,
        revokedAt: null,
        ...(params.isRegeneration ? { regeneratedAt: now } : {}),
      },
    });
    return this.mapToEntity(record as LearnerAccessGrantDbRecord);
  }

  async setEnabled(learnerId: string, enabled: boolean): Promise<LearnerAccessGrantEntity | null> {
    const existing = await this.prisma.learnerAccessGrant.findUnique({ where: { learnerId } });
    if (!existing) return null;

    const record = await this.prisma.learnerAccessGrant.update({
      where: { learnerId },
      data: {
        enabled,
        revokedAt: enabled ? null : new Date(),
      },
    });
    return this.mapToEntity(record as LearnerAccessGrantDbRecord);
  }

  async recordUsage(learnerId: string): Promise<void> {
    await this.prisma.learnerAccessGrant.update({
      where: { learnerId },
      data: { lastUsedAt: new Date() },
    });
  }

  private mapToEntity(record: LearnerAccessGrantDbRecord): LearnerAccessGrantEntity {
    return new LearnerAccessGrantEntity({
      id: record.id,
      learnerId: record.learnerId,
      familyId: record.familyId,
      codeHash: record.codeHash,
      enabled: record.enabled,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      regeneratedAt: record.regeneratedAt,
      revokedAt: record.revokedAt,
      lastUsedAt: record.lastUsedAt,
    });
  }
}
