import type { UserSummaryDto } from '@aletheia/contracts';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
}

export const IDENTITY_PUBLIC_API = Symbol('IDENTITY_PUBLIC_API');

export interface IdentityPublicApi {
  verifyToken(token: string): Promise<AuthenticatedUserPayload | null>;
  findUserById(userId: string): Promise<UserSummaryDto | null>;
  // Real platform-admin role (issue #101) -- replaces the temporary
  // "guardian of any family" proxy PR #100 used. Not derived from the JWT
  // (which doesn't carry roles); checked live against the User row.
  isPlatformAdmin(userId: string): Promise<boolean>;
}
