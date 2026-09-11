import { resolveOverride, resolveOverrideMap } from './override-resolver.js';

describe('resolveOverride', () => {
  it('uses the family override when present', () => {
    const result = resolveOverride('platform-value', 'family-value');
    expect(result).toEqual({ value: 'family-value', source: 'family' });
  });

  it('falls back to the platform default when the family override is absent', () => {
    const result = resolveOverride('platform-value', undefined);
    expect(result).toEqual({ value: 'platform-value', source: 'platform' });
  });

  it('resolves to none when neither tier has a value', () => {
    const result = resolveOverride<string>(undefined, undefined);
    expect(result).toEqual({ value: undefined, source: 'none' });
  });

  it('a locked property always resolves to the platform default, even when the family provided one', () => {
    const result = resolveOverride('platform-value', 'family-value', { locked: true });
    expect(result).toEqual({ value: 'platform-value', source: 'locked' });
  });

  it('a locked property with no platform default resolves to none, not the family override', () => {
    const result = resolveOverride<string>(undefined, 'family-value', { locked: true });
    expect(result).toEqual({ value: undefined, source: 'none' });
  });

  it('treats a falsy-but-defined family override (0, false, "") as present', () => {
    expect(resolveOverride(10, 0)).toEqual({ value: 0, source: 'family' });
    expect(resolveOverride(true, false)).toEqual({ value: false, source: 'family' });
    expect(resolveOverride('default', '')).toEqual({ value: '', source: 'family' });
  });
});

describe('resolveOverrideMap', () => {
  interface Prefs extends Record<string, unknown> {
    structureLevel: string;
    weeklyHours: number;
    theme: string;
  }

  it('resolves each property independently, preferring the family value where present', () => {
    const platformDefaults: Partial<Prefs> = { structureLevel: 'MODERATE', weeklyHours: 20 };
    const familyOverrides: Partial<Prefs> = { structureLevel: 'FLEXIBLE' };

    const { values, sources } = resolveOverrideMap(platformDefaults, familyOverrides);

    expect(values).toEqual({ structureLevel: 'FLEXIBLE', weeklyHours: 20 });
    expect(sources).toEqual({ structureLevel: 'family', weeklyHours: 'platform' });
  });

  it('includes a property only the family set, with no platform default', () => {
    const { values, sources } = resolveOverrideMap<Prefs>({}, { theme: 'dark' });
    expect(values).toEqual({ theme: 'dark' });
    expect(sources).toEqual({ theme: 'family' });
  });

  it('enforces locked keys across the whole map regardless of family input', () => {
    const platformDefaults: Partial<Prefs> = { structureLevel: 'MODERATE', theme: 'light' };
    const familyOverrides: Partial<Prefs> = { structureLevel: 'FLEXIBLE', theme: 'dark' };

    const { values, sources } = resolveOverrideMap(platformDefaults, familyOverrides, ['structureLevel']);

    expect(values.structureLevel).toBe('MODERATE');
    expect(sources.structureLevel).toBe('locked');
    expect(values.theme).toBe('dark');
    expect(sources.theme).toBe('family');
  });
});
