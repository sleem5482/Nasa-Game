import {
  DAILY_BASE_DRAIN,
  DEFAULT_SYSTEMS,
  isDustyDay,
  isMoonNight,
  OUTPOST_SYSTEMS,
  POWER_GENERATION,
  RESOURCE_META,
  RESOURCE_ORDER,
  SYSTEM_BY_ID,
} from "./constants";
import {
  eventById,
  eventPoolForPlanet,
  FOLLOW_UPS,
  GAME_EVENTS,
} from "./events";
import type {
  BreakdownStep,
  DayResult,
  DecisionChoice,
  DecisionRecord,
  GameEvent,
  Planet,
  RescueOption,
  ResourceKey,
  Resources,
  SystemPlan,
} from "./types";

export function clampMeter(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyDelta(
  resources: Resources,
  delta: Partial<Resources>,
): Resources {
  const next = { ...resources };
  RESOURCE_ORDER.forEach((key) => {
    next[key] = clampMeter(next[key] + (delta[key] ?? 0));
  });
  return next;
}

/** Add two partial deltas together. */
export function mergeDelta(
  a: Partial<Resources>,
  b: Partial<Resources>,
): Partial<Resources> {
  const out: Partial<Resources> = { ...a };
  RESOURCE_ORDER.forEach((key) => {
    const sum = (a[key] ?? 0) + (b[key] ?? 0);
    if (sum !== 0) out[key] = sum;
  });
  return out;
}

export function totalDelta(deltas: Partial<Resources>[]): Partial<Resources> {
  return deltas.reduce<Partial<Resources>>(
    (sum, delta) => mergeDelta(sum, delta),
    {},
  );
}

/** Solar output after dust or a long lunar night. */
export function solarOutput(planet: Planet, day: number): number {
  let output = POWER_GENERATION;
  if (isDustyDay(planet, day)) output -= 3;
  if (isMoonNight(planet, day)) output -= 3;
  return output;
}

export function planetCondition(planet: Planet, day: number): Partial<Resources> {
  if (isDustyDay(planet, day)) return { power: -3 };
  if (isMoonNight(planet, day)) return { power: -3, lifeSupport: -1 };
  return {};
}

export function planetConditionLabel(planet: Planet, day: number): string {
  if (isDustyDay(planet, day)) return "Mars dust covers the solar panels";
  if (isMoonNight(planet, day)) return "Long lunar night cools the base";
  return "Clear skies over the base";
}

export function powerDraw(plan: SystemPlan): number {
  return OUTPOST_SYSTEMS.reduce(
    (sum, system) => sum + (plan[system.id] ? system.powerCost : 0),
    0,
  );
}

export function runningSystems(plan: SystemPlan) {
  return OUTPOST_SYSTEMS.filter((system) => plan[system.id]);
}

/** Resource changes and power cost of the systems kept running. */
export function systemEffect(plan: SystemPlan): Partial<Resources> {
  let delta: Partial<Resources> = {};
  OUTPOST_SYSTEMS.forEach((system) => {
    const on = plan[system.id];
    const effects = on ? system.effects : system.offEffects;
    if (effects) delta = mergeDelta(delta, effects);
  });
  return delta;
}

export function previewResourceChange(
  resources: Resources,
  planet: Planet,
  day: number,
  choice: DecisionChoice,
  plan: SystemPlan,
): Resources {
  const delta = totalDelta([
    DAILY_BASE_DRAIN,
    planetCondition(planet, day),
    { power: solarOutput(planet, day) - powerDraw(plan) },
    systemEffect(plan),
    choice.effects,
  ]);
  return applyDelta(resources, delta);
}

export function resolveDay(args: {
  day: number;
  planet: Planet;
  resources: Resources;
  choice: DecisionChoice;
  plan: SystemPlan;
}): DayResult {
  const { day, planet, resources, choice, plan } = args;

  const steps: BreakdownStep[] = [
    { label: `Your decision: ${choice.label}`, delta: choice.effects },
    { label: "Machines kept running", delta: systemEffect(plan) },
    {
      label: `Solar array (+${solarOutput(planet, day)} power)`,
      delta: { power: solarOutput(planet, day) - powerDraw(plan) },
    },
    { label: "Daily crew needs", delta: DAILY_BASE_DRAIN },
    { label: planetConditionLabel(planet, day), delta: planetCondition(planet, day) },
  ];

  const filtered = steps.filter(
    (step) => Object.values(step.delta).some((value) => (value ?? 0) !== 0),
  );
  const after = applyDelta(
    resources,
    totalDelta(filtered.map((step) => step.delta)),
  );
  const rescueNeeded =
    RESOURCE_ORDER.find((key) => after[key] <= 0) ?? null;

  const lowest = Math.min(...RESOURCE_ORDER.map((key) => after[key]));
  const tone: DayResult["tone"] =
    rescueNeeded !== null || lowest < 25
      ? "danger"
      : lowest < 45
        ? "ok"
        : "great";

  return {
    day,
    eventTitle: "",
    choiceLabel: choice.label,
    before: { ...resources },
    after,
    steps: filtered,
    lesson: choice.lesson,
    takeaway: choice.takeaway,
    systems: plan,
    tone,
    rescueNeeded,
  };
}

export function buildRescueOptions(
  resources: Resources,
  zeroKey: ResourceKey,
): RescueOption[] {
  const others = RESOURCE_ORDER.filter((key) => key !== zeroKey);
  const strongest = others.reduce((a, b) =>
    resources[a] >= resources[b] ? a : b,
  );
  const second = others.find((key) => key !== strongest) ?? others[0];
  // Never let a rescue option empty another meter: that would just move the
  // emergency instead of solving it.
  const strongCost = Math.min(15, Math.max(0, resources[strongest] - 1));
  const secondCost = Math.min(10, Math.max(0, resources[strongest] - 1));

  const options: Omit<RescueOption, "safe">[] = [
    {
      id: "emergency-reserve",
      label: "Open the Emergency Reserve",
      description: `An emergency tank refills ${RESOURCE_META[zeroKey].label.toLowerCase()} but drains stored ${RESOURCE_META[strongest].label.toLowerCase()}.`,
      effects: { [zeroKey]: 30, [strongest]: -strongCost },
    },
    {
      id: "earth-resupply",
      label: "Ask Earth for an Emergency Resupply",
      description: `A small resupply arrives, but it costs ${RESOURCE_META[strongest].label.toLowerCase()} and part of the ${RESOURCE_META[second].label.toLowerCase()} reserve.`,
      effects: { [zeroKey]: 20, [second]: 8, [strongest]: -secondCost },
    },
  ];

  return options.map((option) => {
    const next = applyDelta(resources, option.effects);
    const safe = RESOURCE_ORDER.every((key) => next[key] > 0);
    return { ...option, safe };
  });
}

export function computeStars(
  resources: Resources,
  won: boolean,
  rescueUsed: boolean,
): number {
  if (!won) return 1;
  const lowest = Math.min(...RESOURCE_ORDER.map((key) => resources[key]));
  if (lowest >= 55 && !rescueUsed) return 3;
  if (lowest >= 30) return 2;
  return 1;
}

/** First day of the mission is always the planet's signature emergency. */
function introEventId(planet: Planet): string {
  return planet === "mars" ? "dust-storm" : "lunar-night";
}

export function pickHandWrittenEvent(args: {
  planet: Planet;
  day: number;
  missionLength: number;
  decisions: DecisionRecord[];
  usedIds: string[];
  /** Events that must not be picked (for example a flare when the Sun was quiet). */
  excludedIds?: string[];
}): GameEvent {
  const { planet, day, missionLength, decisions, usedIds, excludedIds = [] } =
    args;

  if (day >= missionLength) return cloneEvent(eventById("final-check")!);
  if (day === 1) return cloneEvent(eventById(introEventId(planet))!);

  // Follow-ups make the base feel like it remembers yesterday.
  const last = decisions[decisions.length - 1];
  if (last) {
    for (const tag of [...last.tags].reverse()) {
      const followUpId = FOLLOW_UPS[tag];
      if (!followUpId) continue;
      if (usedIds.includes(followUpId)) continue;
      if (excludedIds.includes(followUpId)) continue;
      const followUp = eventById(followUpId);
      if (!followUp) continue;
      if (
        followUp.planet &&
        followUp.planet !== "both" &&
        followUp.planet !== planet
      ) {
        continue;
      }
      return cloneEvent(followUp);
    }
  }

  const pool = eventPoolForPlanet(planet).filter(
    (event) =>
      event.id !== "final-check" &&
      event.id !== introEventId(planet) &&
      !excludedIds.includes(event.id),
  );
  const fresh = pool.filter((event) => !usedIds.includes(event.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const offset = planet === "mars" ? 1 : 0;
  const index = (day + offset) % candidates.length;
  return cloneEvent(candidates[index]);
}

function cloneEvent(event: GameEvent): GameEvent {
  return structuredClone(event);
}

export function formatDelta(delta: Partial<Resources>): string {
  return RESOURCE_ORDER.map((key) => {
    const value = delta[key] ?? 0;
    if (value === 0) return null;
    return `${value > 0 ? "+" : ""}${value} ${RESOURCE_META[key].label}`;
  })
    .filter(Boolean)
    .join(" · ");
}

export function dayLabel(planet: Planet | null, day: number): string {
  return planet === "mars" ? `Sol ${day}` : `Day ${day}`;
}

export function systemLabel(id: keyof SystemPlan): string {
  return SYSTEM_BY_ID[id].name;
}

/** All event ids the crew has already seen this mission. */
export function seenEventIds(decisions: DecisionRecord[]): string[] {
  return decisions.map((decision) => decision.eventId);
}

/** True when the event can be triggered on this planet. */
export function eventFitsPlanet(event: GameEvent, planet: Planet): boolean {
  return !event.planet || event.planet === "both" || event.planet === planet;
}

export function defaultSystemPlan(): SystemPlan {
  return { ...DEFAULT_SYSTEMS };
}

/** Every choice in the game, handy for balance checks. */
export function allChoices(): DecisionChoice[] {
  return GAME_EVENTS.flatMap((event) => event.choices);
}
