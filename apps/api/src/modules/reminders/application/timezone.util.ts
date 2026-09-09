// Small self-contained timezone helpers so the reminder scheduler can work
// out "what time is it right now for this family" and "when did their local
// day start" without pulling in a new date library for two calculations.

export interface LocalTime {
  hhmm: string;
  dateKey: string;
}

export function currentLocalTime(date: Date, timeZone: string): LocalTime {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    hhmm: `${parts.hour}:${parts.minute}`,
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

function timezoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
  const offsetPart = formatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0';
  const match = /GMT([+-]\d{1,2})(?::?(\d{2}))?/.exec(offsetPart);
  if (!match) return 0;

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  return hours * 60 + (hours < 0 ? -minutes : minutes);
}

// Returns the UTC instant corresponding to 00:00 local time, for `date`'s
// local calendar day in `timeZone`.
export function startOfLocalDayUtc(date: Date, timeZone: string): Date {
  const { dateKey } = currentLocalTime(date, timeZone);
  const offsetMinutes = timezoneOffsetMinutes(date, timeZone);
  return new Date(new Date(`${dateKey}T00:00:00Z`).getTime() - offsetMinutes * 60 * 1000);
}
