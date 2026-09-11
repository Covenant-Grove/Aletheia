import { CurriculumRepository } from './curriculum.repository.js';

describe('CurriculumRepository catalog application', () => {
  it.each(['learner', 'academicYear'])('rejects a foreign %s before any template writes', async (missing) => {
    const tx = {
      learner: { findFirst: jest.fn().mockResolvedValue(missing === 'learner' ? null : { id: 'learner' }) },
      academicYear: { findFirst: jest.fn().mockResolvedValue(missing === 'academicYear' ? null : { id: 'year' }) },
      learnerCurriculumPlan: { upsert: jest.fn() },
      subject: { create: jest.fn() },
      learningObjective: { create: jest.fn() },
    };
    const prisma = { $transaction: jest.fn((fn) => fn(tx)) };
    const repo = new CurriculumRepository(prisma as any);
    await expect((repo as any).applyPublishedTemplate('family', { learnerId: 'learner', academicYearId: 'year' }, { id: 'definition', subjects: [] }, 'CUSTOM')).rejects.toThrow('Learner or academic year not found');
    expect(tx.learnerCurriculumPlan.upsert).not.toHaveBeenCalled();
    expect(tx.subject.create).not.toHaveBeenCalled();
    expect(tx.learningObjective.create).not.toHaveBeenCalled();
  });
});

describe('learner plan metadata edits', () => {
  it('preserves the catalog pin when a caller repeats the existing compatibility framework', async () => {
    const existing = { id: 'plan', familyId: 'family', learnerId: 'learner', academicYearId: 'year', pedagogicalFramework: 'CUSTOM', pedagogicalModelDefinitionId: 'pinned-version' };
    const prisma = { learnerCurriculumPlan: {
      findUnique: jest.fn().mockResolvedValue(existing),
      upsert: jest.fn().mockResolvedValue(existing),
    } };
    Object.assign(prisma, { $transaction: jest.fn((fn) => fn(prisma)) });
    const repo = new CurriculumRepository(prisma as any);
    await repo.upsertLearnerPlan('family', { learnerId: 'learner', academicYearId: 'year', pedagogicalFramework: 'CUSTOM', notes: 'Edited' });
    expect(prisma.learnerCurriculumPlan.upsert.mock.calls[0][0].update).not.toHaveProperty('pedagogicalModelDefinitionId');
  });
});

describe('concurrent learner plan edits', () => {
  it('retries the whole comparison after serialization conflict against a newly applied model', async () => {
    const tx = { learnerCurriculumPlan: {
      findUnique: jest.fn()
        .mockResolvedValueOnce({ pedagogicalFramework: 'CUSTOM' })
        .mockResolvedValueOnce({ pedagogicalFramework: 'MONTESSORI' }),
      upsert: jest.fn().mockResolvedValue({ id: 'plan' }),
    } };
    const prisma = { $transaction: jest.fn()
      .mockImplementationOnce(async (fn) => { await fn(tx); throw { code: 'P2034' }; })
      .mockImplementationOnce((fn) => fn(tx)),
    };
    await new CurriculumRepository(prisma as any).upsertLearnerPlan('family', {
      learnerId: 'learner', academicYearId: 'year', pedagogicalFramework: 'CUSTOM', notes: 'Edited',
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(prisma.$transaction).toHaveBeenLastCalledWith(expect.any(Function), { isolationLevel: 'Serializable' });
    expect(tx.learnerCurriculumPlan.findUnique).toHaveBeenCalledTimes(2);
    expect(tx.learnerCurriculumPlan.upsert.mock.calls[0][0].update).not.toHaveProperty('pedagogicalModelDefinitionId');
    expect(tx.learnerCurriculumPlan.upsert.mock.calls[1][0].update).toMatchObject({ pedagogicalFramework: 'CUSTOM', pedagogicalModelDefinitionId: null });
  });

  it('bounds serialization retries and propagates the last conflict', async () => {
    const conflict = { code: 'P2034' };
    const prisma = { $transaction: jest.fn().mockRejectedValue(conflict) };
    await expect(new CurriculumRepository(prisma as any).upsertLearnerPlan('family', {
      learnerId: 'learner', academicYearId: 'year', pedagogicalFramework: 'CUSTOM',
    })).rejects.toBe(conflict);
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });

  it('keeps notes-only edits as one update that cannot change framework or pin', async () => {
    const prisma = { learnerCurriculumPlan: { upsert: jest.fn().mockResolvedValue({ id: 'plan' }) }, $transaction: jest.fn() };
    await new CurriculumRepository(prisma as any).upsertLearnerPlan('family', { learnerId: 'learner', academicYearId: 'year', notes: 'Edited' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.learnerCurriculumPlan.upsert.mock.calls[0][0].update).toEqual({ notes: 'Edited' });
  });
});
