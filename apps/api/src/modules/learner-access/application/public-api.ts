export const LEARNER_ACCESS_PUBLIC_API = Symbol('LEARNER_ACCESS_PUBLIC_API');

export interface VerifiedLearnerSession {
  learnerId: string;
  familyId: string;
}

export interface LearnerAccessPublicApi {
  // Verifies the token's signature/claim shape AND re-checks the grant's
  // current `enabled` state on every call -- a guardian disabling access
  // must take effect on the learner's very next request, not just future
  // logins.
  verifyLearnerToken(token: string): Promise<VerifiedLearnerSession | null>;
}
