import { NextResponse } from "next/server";
import { MISSION_LENGTH } from "@/lib/game/constants";
import { addDays, archived, isoDate, live } from "@/lib/game/dataSource";
import { normalizeDonki } from "@/lib/game/spaceWeather";
import type { SpaceWeatherState } from "@/lib/game/types";

// Set NASA_API_KEY in .env.local. DEMO_KEY allows only ~30 requests/hour.
const KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const DONKI = "https://api.nasa.gov/DONKI";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function donki(kind: "FLR" | "CME", start: string, end: string): Promise<unknown> {
  const url = `${DONKI}/${kind}?startDate=${start}&endDate=${end}&api_key=${KEY}`;
  const response = await fetch(url, {
    next: { revalidate: 3600 }, // one NASA call per hour is plenty
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`DONKI ${kind} ${response.status}`);
  return response.json();
}

/**
 * GET /api/space-weather            -> the last 14 real days (LIVE)
 * GET /api/space-weather?start=DATE -> a past 14-day period (ARCHIVED)
 * If NASA cannot be reached the response has failed:true and the game falls
 * back to its hand-written events.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const today = isoDate(new Date());
  const requested = searchParams.get("start");
  const replay = requested && DATE_RE.test(requested) && requested < today ? requested : null;

  const start = replay ?? addDays(today, -(MISSION_LENGTH - 1));
  const end = addDays(start, MISSION_LENGTH - 1);

  try {
    const [flares, cmes] = await Promise.all([donki("FLR", start, end), donki("CME", start, end)]);
    const state: SpaceWeatherState = {
      source: replay ? archived("DONKI", `${start} – ${end}`) : live("DONKI", today),
      startDate: start,
      events: normalizeDonki(flares, cmes),
    };
    return NextResponse.json(state);
  } catch {
    const state: SpaceWeatherState = {
      source: archived("DONKI"),
      startDate: start,
      events: [],
      failed: true,
    };
    return NextResponse.json(state);
  }
}
