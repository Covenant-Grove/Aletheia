import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { LearnerAccessGuard, LearnerSelfGuard } from './learner-access.guard.js';
import type { LearnerAccessPublicApi } from '../../modules/learner-access/application/public-api.js';
import { LEARNER_SESSION_COOKIE_NAME } from './session-cookie.js';

function makeContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('LearnerAccessGuard', () => {
  let learnerAccessApi: jest.Mocked<LearnerAccessPublicApi>;
  let guard: LearnerAccessGuard;

  beforeEach(() => {
    learnerAccessApi = {
      verifyLearnerToken: jest.fn(),
    };
    guard = new LearnerAccessGuard(learnerAccessApi);
  });

  it('rejects a request with no learner session cookie', async () => {
    const context = makeContext({ cookies: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a token that fails verification', async () => {
    learnerAccessApi.verifyLearnerToken.mockResolvedValue(null);
    const context = makeContext({ cookies: { [LEARNER_SESSION_COOKIE_NAME]: 'bad-token' } });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('sets request.learner (never request.user) for a valid token', async () => {
    learnerAccessApi.verifyLearnerToken.mockResolvedValue({
      learnerId: 'learner-1',
      familyId: 'fam-1',
    });
    const request: Record<string, unknown> = { cookies: { [LEARNER_SESSION_COOKIE_NAME]: 'good-token' } };
    const context = makeContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.learner).toEqual({ learnerId: 'learner-1', familyId: 'fam-1' });
    expect(request.user).toBeUndefined();
  });
});

describe('LearnerSelfGuard', () => {
  const guard = new LearnerSelfGuard();

  it('allows a request whose route learnerId matches the session', () => {
    const context = makeContext({
      params: { learnerId: 'learner-1' },
      learner: { learnerId: 'learner-1', familyId: 'fam-1' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request for a different learnerId', () => {
    const context = makeContext({
      params: { learnerId: 'learner-2' },
      learner: { learnerId: 'learner-1', familyId: 'fam-1' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects when there is no learner session at all', () => {
    const context = makeContext({ params: { learnerId: 'learner-1' } });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
