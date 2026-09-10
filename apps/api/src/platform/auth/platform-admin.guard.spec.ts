import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PlatformAdminGuard } from './platform-admin.guard.js';
import type { IdentityPublicApi } from '../../modules/identity/application/public-api.js';

function makeContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('PlatformAdminGuard', () => {
  let identityApi: jest.Mocked<IdentityPublicApi>;
  let guard: PlatformAdminGuard;

  beforeEach(() => {
    identityApi = {
      verifyToken: jest.fn(),
      findUserById: jest.fn(),
      isPlatformAdmin: jest.fn(),
    };
    guard = new PlatformAdminGuard(identityApi);
  });

  it('rejects a request with no authenticated user', async () => {
    const context = makeContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(identityApi.isPlatformAdmin).not.toHaveBeenCalled();
  });

  it('rejects an authenticated user who is not a platform admin', async () => {
    identityApi.isPlatformAdmin.mockResolvedValue(false);
    const context = makeContext({ user: { userId: 'user-1', email: 'a@example.com' } });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(identityApi.isPlatformAdmin).toHaveBeenCalledWith('user-1');
  });

  it('allows an authenticated platform admin', async () => {
    identityApi.isPlatformAdmin.mockResolvedValue(true);
    const context = makeContext({ user: { userId: 'admin-1', email: 'admin@example.com' } });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(identityApi.isPlatformAdmin).toHaveBeenCalledWith('admin-1');
  });
});
