import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FAMILY_PUBLIC_API,
  type FamilyPublicApi,
} from '../../modules/families/application/public-api.js';

// Gate for platform-wide (non-family-scoped) admin surfaces, e.g. curriculum
// definition CRUD (issue #96 Fase 0). Unlike FamilyTenantGuard, this does
// NOT scope access to one family -- these resources (learning domains,
// competencies, pedagogical models, paths, skills) aren't owned by any
// single family.
//
// There is no platform-admin/superadmin role anywhere in this codebase.
// Reusing "is this user a guardian/educator of *some* family" is the
// closest existing analog to an authorized adult user, and deliberately
// does not invent a new role or auth scheme. This is a known-coarse
// judgment call for Fase 0: today, ANY guardian in ANY family can create
// or publish platform-wide catalog content visible to every family. A real
// platform-admin role (or an allowlist) should replace this before this
// API is used for anything beyond internal/trusted seeding. Flagged
// explicitly in the PR and issue comment for human review.
//
// Must run after JwtAuthGuard (needs request.user already populated).
@Injectable()
export class GuardianOnlyGuard implements CanActivate {
  constructor(
    @Inject(FAMILY_PUBLIC_API)
    private readonly familyPublicApi: FamilyPublicApi,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const isGuardian = await this.familyPublicApi.isGuardianAnywhere(user.userId);
    if (!isGuardian) {
      throw new ForbiddenException('This action requires a guardian/educator account.');
    }

    return true;
  }
}
