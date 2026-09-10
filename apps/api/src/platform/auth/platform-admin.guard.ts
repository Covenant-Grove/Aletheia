import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IDENTITY_PUBLIC_API,
  type IdentityPublicApi,
} from '../../modules/identity/application/public-api.js';

// Gate for platform-wide (non-family-scoped) admin surfaces, e.g. curriculum
// definition CRUD (issue #96 Fase 0, issue #101). Checks the real
// `User.isPlatformAdmin` flag rather than any family-membership proxy --
// replaces the temporary GuardianOnlyGuard from PR #100.
//
// Must run after JwtAuthGuard (needs request.user already populated).
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_PUBLIC_API)
    private readonly identityPublicApi: IdentityPublicApi,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const isAdmin = await this.identityPublicApi.isPlatformAdmin(user.userId);
    if (!isAdmin) {
      throw new ForbiddenException('This action requires a platform-admin account.');
    }

    return true;
  }
}
