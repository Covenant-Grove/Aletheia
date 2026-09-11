import { Injectable } from '@nestjs/common';
import type { Prisma, PedagogicalProfile, TheologicalProfile } from '@prisma/client';
import type { UpsertPedagogicalProfileOutput, UpsertTheologicalProfileOutput } from '@aletheia/contracts';
import { PrismaService } from '../../../platform/database/prisma.service.js';

// Append-only reads/writes for the per-family profile tables (issue #96
// Fase 1, sections 13/14). "Upserting" always INSERTs a new row with the
// next version for that family -- never UPDATEs in place -- so history is
// never destroyed. "Current" is just the highest-version row.
@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestPedagogicalProfile(familyId: string): Promise<PedagogicalProfile | null> {
    return this.prisma.pedagogicalProfile.findFirst({
      where: { familyId },
      orderBy: { version: 'desc' },
    });
  }

  async createPedagogicalProfileVersion(
    familyId: string,
    dto: UpsertPedagogicalProfileOutput,
  ): Promise<PedagogicalProfile> {
    const latest = await this.findLatestPedagogicalProfile(familyId);
    const nextVersion = (latest?.version ?? 0) + 1;
    return this.prisma.pedagogicalProfile.create({
      data: {
        familyId,
        version: nextVersion,
        primaryModelCode: dto.primaryModelCode,
        secondaryModels: dto.secondaryModels as unknown as Prisma.InputJsonValue,
        overrides: dto.overrides as Prisma.InputJsonValue,
      },
    });
  }

  async listPedagogicalProfileHistory(familyId: string): Promise<PedagogicalProfile[]> {
    return this.prisma.pedagogicalProfile.findMany({
      where: { familyId },
      orderBy: { version: 'desc' },
    });
  }

  async findLatestTheologicalProfile(familyId: string): Promise<TheologicalProfile | null> {
    return this.prisma.theologicalProfile.findFirst({
      where: { familyId },
      orderBy: { version: 'desc' },
    });
  }

  async createTheologicalProfileVersion(
    familyId: string,
    dto: UpsertTheologicalProfileOutput,
  ): Promise<TheologicalProfile> {
    const latest = await this.findLatestTheologicalProfile(familyId);
    const nextVersion = (latest?.version ?? 0) + 1;
    return this.prisma.theologicalProfile.create({
      data: {
        familyId,
        version: nextVersion,
        preferredTraditionCode: dto.preferredTraditionCode ?? null,
        topicOverrides: dto.topicOverrides as Prisma.InputJsonValue,
      },
    });
  }

  async listTheologicalProfileHistory(familyId: string): Promise<TheologicalProfile[]> {
    return this.prisma.theologicalProfile.findMany({
      where: { familyId },
      orderBy: { version: 'desc' },
    });
  }
}
