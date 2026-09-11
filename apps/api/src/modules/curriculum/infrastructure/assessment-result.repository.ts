import { Injectable } from '@nestjs/common';
import type { AssessmentResult, AssessmentResultScore, Prisma } from '@prisma/client';
import { PrismaService } from '../../../platform/database/prisma.service.js';

export type AssessmentResultWithScores = AssessmentResult & { scores: AssessmentResultScore[] };

export interface CreateAssessmentResultInput {
  familyId: string;
  learnerId: string;
  evidenceSubmissionId?: string | null | undefined;
  rubricDefinitionId: string;
  rubricVersion: number;
  assessorType: string;
  assessorUserId?: string | null | undefined;
  notes?: string | null | undefined;
  scores: { rubricCriterionId: string; score: number; notes?: string | null | undefined }[];
}

// Thin persistence for AssessmentResult (issue #96 Fase 2, section 10's
// last item: "resultado guarda qual versão foi usada"). Same shared-
// PrismaService approach as EvidenceSubmissionRepository for simple
// tenant-scoped reads against Learner/RubricDefinition.
@Injectable()
export class AssessmentResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLearnerFamilyId(learnerId: string): Promise<string | null> {
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId }, select: { familyId: true } });
    return learner?.familyId ?? null;
  }

  async findEvidenceSubmissionFamilyId(evidenceSubmissionId: string): Promise<string | null> {
    const submission = await this.prisma.evidenceSubmission.findUnique({
      where: { id: evidenceSubmissionId },
      select: { familyId: true },
    });
    return submission?.familyId ?? null;
  }

  async findRubricDefinitionVersion(rubricDefinitionId: string): Promise<number | null> {
    const rubric = await this.prisma.rubricDefinition.findUnique({
      where: { id: rubricDefinitionId },
      select: { version: true },
    });
    return rubric?.version ?? null;
  }

  async findRubricCriterionIdsForRubric(rubricDefinitionId: string): Promise<Set<string>> {
    const criteria = await this.prisma.rubricCriterion.findMany({
      where: { rubricId: rubricDefinitionId },
      select: { id: true },
    });
    return new Set(criteria.map((c) => c.id));
  }

  create(input: CreateAssessmentResultInput): Promise<AssessmentResultWithScores> {
    return this.prisma.assessmentResult.create({
      data: {
        familyId: input.familyId,
        learnerId: input.learnerId,
        evidenceSubmissionId: input.evidenceSubmissionId ?? null,
        rubricDefinitionId: input.rubricDefinitionId,
        rubricVersion: input.rubricVersion,
        assessorType: input.assessorType,
        assessorUserId: input.assessorUserId ?? null,
        notes: input.notes ?? null,
        scores: {
          create: input.scores.map((s) => ({
            rubricCriterionId: s.rubricCriterionId,
            score: s.score,
            notes: s.notes ?? null,
          })),
        },
      },
      include: { scores: true },
    });
  }

  findById(familyId: string, id: string): Promise<AssessmentResultWithScores | null> {
    return this.prisma.assessmentResult.findFirst({
      where: { id, familyId },
      include: { scores: true },
    });
  }

  list(familyId: string, learnerId?: string): Promise<AssessmentResultWithScores[]> {
    const where: Prisma.AssessmentResultWhereInput = { familyId };
    if (learnerId) where.learnerId = learnerId;
    return this.prisma.assessmentResult.findMany({
      where,
      include: { scores: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
