import type { LearnerAccessGrantDto } from '@aletheia/contracts';

export interface LearnerAccessGrantProps {
  id: string;
  learnerId: string;
  familyId: string;
  codeHash: string;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  regeneratedAt?: Date | null | undefined;
  revokedAt?: Date | null | undefined;
  lastUsedAt?: Date | null | undefined;
}

export class LearnerAccessGrantEntity {
  constructor(private readonly props: LearnerAccessGrantProps) {}

  get id(): string {
    return this.props.id;
  }

  get learnerId(): string {
    return this.props.learnerId;
  }

  get familyId(): string {
    return this.props.familyId;
  }

  get codeHash(): string {
    return this.props.codeHash;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get regeneratedAt(): Date | null | undefined {
    return this.props.regeneratedAt;
  }

  get revokedAt(): Date | null | undefined {
    return this.props.revokedAt;
  }

  get lastUsedAt(): Date | null | undefined {
    return this.props.lastUsedAt;
  }

  // toDto() deliberately never includes codeHash -- the code is only ever
  // returned in plaintext once, at issuance, via a separate response shape.
  toDto(): LearnerAccessGrantDto {
    return {
      learnerId: this.learnerId,
      enabled: this.enabled,
      createdAt: this.createdAt ? this.createdAt.toISOString() : null,
      regeneratedAt: this.regeneratedAt ? this.regeneratedAt.toISOString() : null,
      lastUsedAt: this.lastUsedAt ? this.lastUsedAt.toISOString() : null,
    };
  }
}
