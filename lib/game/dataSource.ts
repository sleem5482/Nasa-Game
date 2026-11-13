import type { DataSource } from "./types";

/**
 * Date the bundled offline data (data/nasa_archived_data.json) was collected.
 * TODO: set this to the real date you captured the file. It is shown to the
 * player on every ARCHIVED label, so it must be accurate.
 */
export const ARCHIVE_DATE = "2026-11-12";

export const archived = (name: string, date: string = ARCHIVE_DATE): DataSource => ({
  mode: "archived",
  date,
  name,
});

export const live = (name: string, date: string): DataSource => ({
  mode: "live",
  date,
  name,
});

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}
