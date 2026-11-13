import { NextResponse } from "next/server";
import { archived } from "@/lib/game/dataSource";
import type { DataSource } from "@/lib/game/types";

export interface RadLabReading {
  source: DataSource;
  /** Average absorbed dose rate in micro-gray per hour. */
  doseRateUGyPerHour: number;
  samples: number;
  spacecraft: "ISS";
  instrument: "DosTel";
  failed?: false;
}

/**
 * RadLab is an archive of past measurements, so this is always ARCHIVED.
 * The window below is the example from RadLab's own API guide.
 * %3E = ">", %3C = "<", %3A = ":"
 */
const WINDOW_START = "2022-04-01T23:00";
const WINDOW_END = "2022-04-02T01:05";
const URL_ = `https://visualization.osdr.nasa.gov/radlab/api?spacecraft=ISS&instrument=DosTel&timestamp%3E=${WINDOW_START.replace(
  ":",
  "%3A",
)}&timestamp%3C${WINDOW_END.replace(":", "%3A")}&absorbed_dose_rate&format=csv`;

export async function GET() {
  try {
    const response = await fetch(URL_, {
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`RadLab ${response.status}`);
    const lines = (await response.text()).trim().split(/\r?\n/);
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
    const col = header.indexOf("absorbed_dose_rate");
    if (col === -1) throw new Error("column missing");

    const values = lines
      .slice(1)
      .map((line) => Number(line.split(delimiter)[col]))
      .filter((n) => Number.isFinite(n) && n >= 0);
    if (values.length === 0) throw new Error("no readings");

    const body: RadLabReading = {
      source: archived("RadLab", WINDOW_START.slice(0, 10)),
      doseRateUGyPerHour: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      samples: values.length,
      spacecraft: "ISS",
      instrument: "DosTel",
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ failed: true, source: archived("RadLab") });
  }
}
