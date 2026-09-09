import { currentLocalTime, startOfLocalDayUtc } from './timezone.util.js';

describe('timezone.util', () => {
  describe('currentLocalTime', () => {
    it('converts a UTC instant to the family timezone HH:mm and date', () => {
      // 2026-03-05T10:15:00Z is 07:15 in America/Sao_Paulo (UTC-3, no DST since 2019).
      const result = currentLocalTime(new Date('2026-03-05T10:15:00Z'), 'America/Sao_Paulo');
      expect(result.hhmm).toBe('07:15');
      expect(result.dateKey).toBe('2026-03-05');
    });

    it('rolls the date back a day when local time is before midnight UTC', () => {
      // 2026-03-05T01:00:00Z is 2026-03-04T22:00 in America/Sao_Paulo.
      const result = currentLocalTime(new Date('2026-03-05T01:00:00Z'), 'America/Sao_Paulo');
      expect(result.hhmm).toBe('22:00');
      expect(result.dateKey).toBe('2026-03-04');
    });

    it('handles a positive UTC offset timezone', () => {
      // 2026-03-05T20:30:00Z is 2026-03-06T05:30 in Asia/Tokyo (UTC+9).
      const result = currentLocalTime(new Date('2026-03-05T20:30:00Z'), 'Asia/Tokyo');
      expect(result.hhmm).toBe('05:30');
      expect(result.dateKey).toBe('2026-03-06');
    });
  });

  describe('startOfLocalDayUtc', () => {
    it('returns the UTC instant of local midnight for a negative offset', () => {
      const result = startOfLocalDayUtc(new Date('2026-03-05T10:15:00Z'), 'America/Sao_Paulo');
      expect(result.toISOString()).toBe('2026-03-05T03:00:00.000Z');
    });

    it('returns the UTC instant of local midnight for a positive offset', () => {
      const result = startOfLocalDayUtc(new Date('2026-03-05T20:30:00Z'), 'Asia/Tokyo');
      expect(result.toISOString()).toBe('2026-03-05T15:00:00.000Z');
    });
  });
});
