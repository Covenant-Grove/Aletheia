// --- Platform -> Family override resolver (issue #96 section 26) ---
//
// Generic, reusable resolver for the "Platform -> Tenant -> Family"
// precedence hierarchy #96 describes. There is no backing entity for a
// middle "Tenant"/Community/Organization tier anywhere in this codebase
// today -- Family already is the tenant boundary per FamilyTenantGuard,
// and building a hollow Tenant table with nothing that ever populates it
// would be exactly the premature abstraction this issue's own principles
// warn against. So this resolves two levels now:
//
//   effectiveValue = familyOverride ?? platformDefault
//
// If/when a real Community/Organization entity exists, a middle tier
// slots in between these two without changing this function's contract --
// it would become `familyOverride ?? tenantOverride ?? platformDefault`,
// one more `resolveOverride` call chained the same way.
//
// Not hardcoded to any one field: this operates on a single property at a
// time (resolveOverride) or a whole map of properties (resolveOverrideMap),
// and is deliberately domain-agnostic -- callers own what T is.

export type OverrideSource = 'family' | 'platform' | 'locked' | 'none';

export interface ResolvedOverride<T> {
  value: T | undefined;
  // #96 section 26: "É possível descobrir de onde veio o valor efetivo" --
  // every resolution says which tier it came from, not just the value.
  source: OverrideSource;
}

export interface ResolveOverrideOptions {
  // #96 section 26: "Nem toda configuração é overridable" / "Regras
  // críticas ficam bloqueadas" -- a locked property always resolves to
  // the platform default, regardless of what the family provided.
  locked?: boolean;
}

export function resolveOverride<T>(
  platformDefault: T | undefined,
  familyOverride: T | undefined,
  options: ResolveOverrideOptions = {},
): ResolvedOverride<T> {
  if (options.locked) {
    return { value: platformDefault, source: platformDefault !== undefined ? 'locked' : 'none' };
  }
  if (familyOverride !== undefined) {
    return { value: familyOverride, source: 'family' };
  }
  if (platformDefault !== undefined) {
    return { value: platformDefault, source: 'platform' };
  }
  return { value: undefined, source: 'none' };
}

export interface ResolveOverrideMapResult<T extends Record<string, unknown>> {
  values: Partial<T>;
  sources: Partial<Record<keyof T, OverrideSource>>;
}

// Resolves every property present in either input, per-property -- a
// family can override some properties of a definition without needing to
// restate the whole thing, and a locked property is enforced across the
// whole map, not just when the family happens to omit it.
export function resolveOverrideMap<T extends Record<string, unknown>>(
  platformDefaults: Partial<T>,
  familyOverrides: Partial<T>,
  lockedKeys: ReadonlyArray<keyof T> = [],
): ResolveOverrideMapResult<T> {
  const lockedSet = new Set<keyof T>(lockedKeys);
  const keys = new Set<keyof T>([
    ...(Object.keys(platformDefaults) as (keyof T)[]),
    ...(Object.keys(familyOverrides) as (keyof T)[]),
  ]);

  const values: Partial<T> = {};
  const sources: Partial<Record<keyof T, OverrideSource>> = {};

  for (const key of keys) {
    const resolved = resolveOverride(platformDefaults[key], familyOverrides[key], {
      locked: lockedSet.has(key),
    });
    if (resolved.value !== undefined) {
      values[key] = resolved.value;
    }
    sources[key] = resolved.source;
  }

  return { values, sources };
}
