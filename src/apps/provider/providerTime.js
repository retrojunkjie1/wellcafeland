function zonedParts(date, timezone) {
  try {
    return Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).map(({ type, value }) => [type, value]));
  } catch {
    return null;
  }
}

export function dateToLocalInputInZone(value, timezone) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = zonedParts(date, timezone);
  if (!parts) return "";
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function localInputInZoneToDate(value, timezone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const initial = new Date(target);
  if (initial.getUTCFullYear() !== year || initial.getUTCMonth() !== month - 1
    || initial.getUTCDate() !== day || hour > 23 || minute > 59) return null;

  let candidate = target;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const parts = zonedParts(new Date(candidate), timezone);
    if (!parts) return null;
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    const correction = target - represented;
    if (correction === 0) {
      for (let offsetMinutes = 15; offsetMinutes <= 180; offsetMinutes += 15) {
        for (const direction of [-1, 1]) {
          const alternate = zonedParts(new Date(candidate + direction * offsetMinutes * 60_000), timezone);
          if (alternate && Number(alternate.year) === year && Number(alternate.month) === month
            && Number(alternate.day) === day && Number(alternate.hour) === hour
            && Number(alternate.minute) === minute) return null;
        }
      }
      return new Date(candidate);
    }
    candidate += correction;
  }
  const parts = zonedParts(new Date(candidate), timezone);
  if (parts && Number(parts.year) === year && Number(parts.month) === month
    && Number(parts.day) === day && Number(parts.hour) === hour && Number(parts.minute) === minute) {
    return new Date(candidate);
  }
  return null;
}
