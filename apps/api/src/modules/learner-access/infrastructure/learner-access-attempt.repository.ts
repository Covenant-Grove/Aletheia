import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/database/prisma.service.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

@Injectable()
export class LearnerAccessAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Keyed per-learner, not per-IP: siblings on the same home network share
  // an IP, so an IP-based lockout would let one child's wrong guesses lock
  // out another child's account.
  async isLocked(learnerId: string): Promise<boolean> {
    const record = await this.prisma.learnerAccessAttempt.findUnique({
      where: { learnerId },
    });
    return Boolean(record?.lockedUntil && record.lockedUntil > new Date());
  }

  async recordFailure(learnerId: string): Promise<void> {
    const existing = await this.prisma.learnerAccessAttempt.findUnique({
      where: { learnerId },
    });
    const attemptCount = (existing?.attemptCount ?? 0) + 1;
    const lockedUntil =
      attemptCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : (existing?.lockedUntil ?? null);

    await this.prisma.learnerAccessAttempt.upsert({
      where: { learnerId },
      create: { learnerId, attemptCount, lockedUntil },
      update: { attemptCount, lockedUntil },
    });
  }

  async reset(learnerId: string): Promise<void> {
    await this.prisma.learnerAccessAttempt.upsert({
      where: { learnerId },
      create: { learnerId, attemptCount: 0, lockedUntil: null },
      update: { attemptCount: 0, lockedUntil: null },
    });
  }
}
