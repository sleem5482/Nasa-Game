import { addDays } from "./dataSource";
import { eventById } from "./events";
import { pickHandWrittenEvent } from "./engine";
import type {
  DecisionChoice,
  DecisionRecord,
  EventSeverity,
  GameEvent,
  Planet,
  ResourceKey,
  Resources,
  SpaceWeatherEvent,
  SpaceWeatherState,
} from "./types";

const SEVERITY_RANK: Record<EventSeverity, number> = {
  minor: 0,
  strong: 1,
  extreme: 2,
};
const SCALE: Record<EventSeverity, number> = {
  minor: 0.6,
  strong: 1,
  extreme: 1.4,
};

/** Game rule of thumb: C and below are small, M is strong, X is extreme. */
export function flareSeverity(classType: string | undefined): EventSeverity {
  const letter = classType?.trim().charAt(0).toUpperCase();
  if (letter === "X") return "extreme";
  if (letter === "M") return "strong";
  return "minor";
}

/** Game rule of thumb based on the CME speed in km/s. */
export function cmeSeverity(speedKmS: number | undefined): EventSeverity {
  if (!speedKmS) return "minor";
  if (speedKmS >= 1800) return "extreme";
  if (speedKmS >= 1000) return "strong";
  return "minor";
}

// ---- Turning raw DONKI JSON into our small shape (used by the API route) ----

interface RawFlare {
  flrID?: string;
  beginTime?: string;
  peakTime?: string;
  classType?: string;
  link?: string;
}

interface RawCme {
  activityID?: string;
  startTime?: string;
  link?: string;
  cmeAnalyses?: { speed?: number | null; isMostAccurate?: boolean }[] | null;
}

export function normalizeDonki(
  flares: unknown,
  cmes: unknown,
): SpaceWeatherEvent[] {
  const out: SpaceWeatherEvent[] = [];

  (Array.isArray(flares) ? (flares as RawFlare[]) : []).forEach((f) => {
    const time = f.peakTime ?? f.beginTime;
    if (!f.flrID || !time) return;
    out.push({
      id: f.flrID,
      kind: "flare",
      time,
      classType: f.classType,
      severity: flareSeverity(f.classType),
      link: f.link,
    });
  });

  (Array.isArray(cmes) ? (cmes as RawCme[]) : []).forEach((c) => {
    if (!c.activityID || !c.startTime) return;
    const analyses = c.cmeAnalyses ?? [];
    const best = analyses.find((a) => a.isMostAccurate) ?? analyses[0];
    const speed = typeof best?.speed === "number" ? best.speed : undefined;
    out.push({
      id: c.activityID,
      kind: "cme",
      time: c.startTime,
      speedKmS: speed,
      severity: cmeSeverity(speed),
      link: c.link,
    });
  });

  return out.sort((a, b) => a.time.localeCompare(b.time));
}

// ---- Mapping events onto mission days ----

/** The real calendar date that mission day N stands for. */
export function realDateForDay(sw: SpaceWeatherState, day: number): string {
  return addDays(sw.startDate, day - 1);
}

function eventsOnDay(sw: SpaceWeatherState, day: number): SpaceWeatherEvent[] {
  const date = realDateForDay(sw, day);
  return sw.events.filter((e) => e.time.slice(0, 10) === date);
}

function strongest(events: SpaceWeatherEvent[]): SpaceWeatherEvent | null {
  if (events.length === 0) return null;
  return events.reduce((a, b) =>
    SEVERITY_RANK[b.severity] > SEVERITY_RANK[a.severity] ? b : a,
  );
}

function scaleChoices(
  choices: DecisionChoice[],
  severity: EventSeverity,
): DecisionChoice[] {
  const k = SCALE[severity];
  return choices.map((choice) => {
    const effects: Partial<Resources> = {};
    (Object.entries(choice.effects) as [ResourceKey, number][]).forEach(
      ([key, value]) => {
        effects[key] = Math.round(value * k);
      },
    );
    return { ...choice, effects };
  });
}

function buildDonkiEvent(
  sw: SpaceWeatherState,
  real: SpaceWeatherEvent,
): GameEvent {
  const base = eventById("solar-flare")!;
  const date = real.time.slice(0, 10);
  const isFlare = real.kind === "flare";

  const title = isFlare
    ? `Solar Flare${real.classType ? ` (class ${real.classType})` : ""}`
    : "Coronal Mass Ejection";

  const story = isFlare
    ? `Captain, the Sun just released a flare. NASA's space-weather log recorded it on ${date}. Radiation around the base is climbing.`
    : `Captain, a huge cloud of solar particles was thrown into space on ${date}${
        real.speedKmS ? `, moving at about ${Math.round(real.speedKmS)} km/s` : ""
      }. Radiation may rise for hours.`;

  const realFact = isFlare
    ? "A solar flare is a sudden burst of light and energy from the Sun. Flares are ranked by strength: C is small, M is medium, and X is the strongest."
    : "A coronal mass ejection (CME) is a giant cloud of charged particles the Sun throws into space. Fast ones can raise the radiation dose for astronauts.";

  return {
    ...structuredClone(base),
    id: `donki-${real.id}`,
    title,
    story,
    impacts: [
      "Radiation around the base rises.",
      "Protection may fall during the storm.",
      "The Earth link may go quiet for a while.",
    ],
    choices: scaleChoices(structuredClone(base.choices), real.severity),
    nasaTag: isFlare ? "DONKI solar flare" : "DONKI coronal mass ejection",
    severity: real.severity,
    imageKey: "solar-flare",
    realFact,
    source: { ...sw.source, date },
  };
}

/**
 * The event for a mission day. Real DONKI events come first. On a day with no
 * real event (or if DONKI could not be reached) we use the hand-written pool,
 * skipping the flare story when the Sun was quiet.
 */
export function pickEventForDay(args: {
  planet: Planet;
  day: number;
  missionLength: number;
  decisions: DecisionRecord[];
  sw: SpaceWeatherState | null;
}): GameEvent {
  const { planet, day, missionLength, decisions, sw } = args;

  if (day >= missionLength) {
    return pickHandWrittenEvent({
      planet,
      day,
      missionLength,
      decisions,
      usedIds: decisions.map((d) => d.eventId),
    });
  }

  const usable = sw && !sw.failed;
  if (usable) {
    const real = strongest(eventsOnDay(sw, day));
    if (real) return buildDonkiEvent(sw, real);
  }

  return pickHandWrittenEvent({
    planet,
    day,
    missionLength,
    decisions,
    usedIds: decisions.map((d) => d.eventId),
    excludedIds: usable ? ["solar-flare"] : [],
  });
}

/** A friendly heads-up for a strong real event arriving in the next two days. */
export function upcomingSpaceWeather(
  day: number,
  sw: SpaceWeatherState | null,
  missionLength: number,
): { tone: "info" | "warn"; message: string } | null {
  if (!sw || sw.failed) return null;
  for (const ahead of [1, 2]) {
    if (day + ahead > missionLength) return null;
    const real = strongest(eventsOnDay(sw, day + ahead));
    if (!real) continue;
    if (real.severity === "minor") continue;
    return {
      tone: real.severity === "extreme" ? "warn" : "info",
      message: `Space-weather watch: a ${real.kind === "flare" ? "solar flare" : "CME"} was recorded for ${
        ahead === 1 ? "tomorrow" : "in 2 days"
      }. Think about Protection.`,
    };
  }
  return null;
}
