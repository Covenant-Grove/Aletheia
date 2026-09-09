import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LEARNER_ACCESS_PUBLIC_API,
  type LearnerAccessPublicApi,
} from '../../modules/learner-access/application/public-api.js';
import { LEARNER_SESSION_COOKIE_NAME } from './session-cookie.js';

// Cookie-only, deliberately no Bearer-header fallback -- this is a
// browser flow for a shared/kiosk-style device, not something an API
// client needs to authenticate with directly.
@Injectable()
export class LearnerAccessGuard implements CanActivate {
  constructor(
    @Inject(LEARNER_ACCESS_PUBLIC_API)
    private readonly learnerAccessApi: LearnerAccessPublicApi,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[LEARNER_SESSION_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException('Missing learner session cookie.');
    }

    const session = await this.learnerAccessApi.verifyLearnerToken(token);
    if (!session) {
      throw new UnauthorizedException('Invalid, expired, or revoked learner session.');
    }

    // Never `request.user` -- keeps a learner session structurally
    // distinct from a guardian session for any downstream code that might
    // assume `request.user` implies a guardian.
    request.learner = session;
    return true;
  }
}

// Belt-and-suspenders on top of the family/learner scoping already implied
// by the token: a route param learnerId must match the session's own.
@Injectable()
export class LearnerSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const paramLearnerId = request.params?.learnerId;
    const sessionLearnerId = request.learner?.learnerId;

    if (!sessionLearnerId || paramLearnerId !== sessionLearnerId) {
      throw new ForbiddenException('You may only access your own learner data.');
    }

    return true;
  }
}
