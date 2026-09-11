/**
 * Timezone and Date Utilities for SmartSend AI
 */

/**
 * Converts a local datetime string (e.g. 2026-09-11T10:00:00) in any IANA timezone (e.g. Asia/Kolkata)
 * accurately into a UTC ISO string (e.g. 2026-09-11T04:30:00.000Z).
 */
export function parseToUtc(dateTimeStr, timeZone) {
  if (!dateTimeStr) return new Date().toISOString();
  const trimmed = String(dateTimeStr).trim();

  // If already ends with Z or has timezone offset, return standard ISO
  if (/Z|[+-]\d{2}(?::?\d{2})?$/.test(trimmed)) {
    return new Date(trimmed).toISOString();
  }

  try {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const [datePart, timePart] = trimmed.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hr, min, sec] = (timePart || '00:00:00').split(':').map(Number);

    const utcBaseline = new Date(Date.UTC(y, m - 1, d, hr, min, sec || 0));

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(utcBaseline);
    const p = {};
    parts.forEach(({ type, value }) => { p[type] = value; });
    const tzYear = Number(p.year);
    const tzMonth = Number(p.month);
    const tzDay = Number(p.day);
    const tzHour = Number(p.hour === '24' ? 0 : p.hour);
    const tzMinute = Number(p.minute);
    const tzSecond = Number(p.second);

    const asLocalInUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond);
    const offsetMs = asLocalInUtc - utcBaseline.getTime();

    return new Date(utcBaseline.getTime() - offsetMs).toISOString();
  } catch (err) {
    console.warn('TZ parse fallback:', err);
    return new Date(trimmed).toISOString();
  }
}

/**
 * Format a UTC ISO scheduled_time string into the designated display timezone
 */
export function formatScheduledDisplay(isoString, timeZone) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);

    const tz = timeZone && timeZone !== 'Local' ? timeZone : undefined;
    return d.toLocaleString(undefined, {
      timeZone: tz,
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (e) {
    return new Date(isoString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
}
