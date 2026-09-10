import type { FamilyResponseDto } from '@aletheia/contracts';

export const FAMILY_PUBLIC_API = Symbol('FAMILY_PUBLIC_API');

export interface FamilyPublicApi {
  isGuardianInFamily(userId: string, familyId: string): Promise<boolean>;
  getFamilyForUser(userId: string, familyId: string): Promise<FamilyResponseDto | null>;
  getFamilyMemberUserIds(familyId: string): Promise<string[]>;
  // Not scoped to a single family — "is this user a guardian/educator of
  // any family" — the closest existing proxy for "authorized adult user",
  // used to gate non-family-scoped admin surfaces (see GuardianOnlyGuard).
  isGuardianAnywhere(userId: string): Promise<boolean>;
}
