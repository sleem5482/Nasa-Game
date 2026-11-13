import { NextResponse } from "next/server";
import { archived, isoDate, live } from "@/lib/game/dataSource";
import type { DataSource } from "@/lib/game/types";

export interface OsdrStudy {
  accession: string;
  title: string;
  organism: string;
  summary: string;
  url: string;
}

interface OsdrResponse {
  source: DataSource;
  studies: OsdrStudy[];
  failed?: boolean;
}

interface Hit {
  _id?: string;
  _source?: Record<string, unknown>;
}

const OSD = /^OSD-\d+$/;

function clip(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/**
 * GET /api/osdr?term=bone%20density
 * The OSDR search also returns studies from NIH GEO and PRIDE. We keep only
 * real OSDR studies (accession OSD-###).
 */
export async function GET(request: Request) {
  const term = (new URL(request.url).searchParams.get("term") ?? "spaceflight").slice(0, 60);
  try {
    const response = await fetch(
      `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(term)}&size=50`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error(`OSDR ${response.status}`);
    const json = (await response.json()) as { hits?: { hits?: Hit[] } };

    const studies: OsdrStudy[] = (json.hits?.hits ?? [])
      .map((hit): OsdrStudy | null => {
        const src = hit._source ?? {};
        const accession = String(src["Accession"] ?? hit._id ?? "");
        const title = String(src["Study Title"] ?? "");
        if (!OSD.test(accession) || !title) return null;
        const organism = Array.isArray(src["organism"]) ? String(src["organism"][0] ?? "") : "";
        return {
          accession,
          title,
          organism,
          summary: clip(String(src["Study Description"] ?? "")),
          url: `https://osdr.nasa.gov/bio/repo/data/studies/${accession}`,
        };
      })
      .filter((s): s is OsdrStudy => s !== null)
      .slice(0, 5);

    if (studies.length === 0) throw new Error("no OSDR studies for term");
    const body: OsdrResponse = { source: live("OSDR", isoDate(new Date())), studies };
    return NextResponse.json(body);
  } catch {
    const body: OsdrResponse = { source: archived("OSDR"), studies: [], failed: true };
    return NextResponse.json(body);
  }
}
