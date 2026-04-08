/**
 * Date helpers (local time)
 *
 * Centralizes common day-grouping logic so screens and context stay consistent.
 */

/**
 * Returns a stable key for the local calendar day that a timestamp falls on.
 *
 * Note: uses the device locale/timezone via `Date`.
 */
export function toLocalDayKey(timestamp: number): string {
  return new Date(timestamp).toDateString();
}

/** True if two timestamps are on the same local calendar day. */
export function isSameLocalDay(aTimestamp: number, bTimestamp: number): boolean {
  return toLocalDayKey(aTimestamp) === toLocalDayKey(bTimestamp);
}
