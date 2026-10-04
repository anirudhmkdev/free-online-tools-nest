export interface AgeResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DAY_MS = 86_400_000;

function dateOnly(date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new Error("Please enter valid dates.");
  const normalized = new Date(0);
  normalized.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized.getTime();
}

/** Calendar anniversaries clamp a missing month-end day to that month's last day. */
function anniversary(birth: Date, months: number): number {
  const year = birth.getUTCFullYear() + Math.floor((birth.getUTCMonth() + months) / 12);
  const month = (birth.getUTCMonth() + months) % 12;
  const end = new Date(0);
  end.setUTCFullYear(year, month + 1, 0);
  const result = new Date(0);
  result.setUTCFullYear(year, month, Math.min(birth.getUTCDate(), end.getUTCDate()));
  result.setUTCHours(0, 0, 0, 0);
  return result.getTime();
}

/** Date-only arithmetic avoids daylight-saving and local-time month boundaries. */
export function computeAge(birthDate: Date, toDate: Date): AgeResult {
  const from = dateOnly(birthDate);
  const to = dateOnly(toDate);
  if (from > to) throw new Error("Date of birth cannot be after the target date.");
  let months = (toDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12
    + toDate.getUTCMonth() - birthDate.getUTCMonth();
  if (anniversary(birthDate, months) > to) months--;
  const residualDays = Math.round((to - anniversary(birthDate, months)) / DAY_MS);
  const totalDays = Math.round((to - from) / DAY_MS);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    weeks: Math.floor(residualDays / 7),
    days: residualDays % 7,
    hours: totalDays * 24,
    minutes: totalDays * 24 * 60,
    seconds: totalDays * 24 * 60 * 60,
  };
}
