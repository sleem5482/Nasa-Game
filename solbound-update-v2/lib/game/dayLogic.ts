import nasaData from "@/data/nasa_archived_data.json";
import {
  POWER_BUDGET,
  RESOURCE_META,
  isMarsDustDay,
  isMoonNight,
} from "./constants";
import type {
  CropPlot,
  DayLogEntry,
  ModuleState,
  Planet,
  PowerAllocation,
  ResourceKey,
  Resources,
  SamiMood,
} from "./types";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function allocationTotal(allocation: PowerAllocation): number {
  return Object.values(allocation).reduce((sum, n) => sum + n, 0);
}

export function previewEffects(
  allocation: PowerAllocation,
  planet: Planet,
): Partial<Resources> {
  const habitat = allocation.habitat;
  const greenhouse = allocation.greenhouse;
  const power = allocation.power;
  const shelter = allocation.shelter;
  const lab = allocation.lab;

  const dustPenalty = planet === "mars" ? 1 : 0;
  const nightPenalty = planet === "moon" ? 1 : 0;

  return {
    energy: Math.round(power * 1.8 - dustPenalty * 2 - nightPenalty - 3),
    water: Math.round(greenhouse * 0.8 + habitat * 0.4 - 2),
    oxygen: Math.round(habitat * 1.4 + greenhouse * 0.6 - lab * 0.5 - 2),
    food: Math.round(greenhouse * 1.5 - 2),
    shielding: Math.round(shelter * 1.6 - nightPenalty - 1),
    science: Math.round(lab * 1.8),
  };
}

export function applyResourceDelta(
  resources: Resources,
  delta: Partial<Resources>,
): Resources {
  const next = { ...resources };
  (Object.keys(delta) as ResourceKey[]).forEach((key) => {
    const change = delta[key] ?? 0;
    if (key === "science") {
      next[key] = Math.max(0, Math.round(next[key] + change));
    } else {
      next[key] = clamp(Math.round(next[key] + change));
    }
  });
  return next;
}

export function getWeakestResource(resources: Resources): ResourceKey {
  const keys: ResourceKey[] = [
    "energy",
    "water",
    "oxygen",
    "food",
    "shielding",
  ];
  return keys.reduce((weakest, key) =>
    resources[key] < resources[weakest] ? key : weakest,
  );
}

export function deriveSamiMood(resources: Resources): SamiMood {
  if (resources.oxygen < 35 || resources.water < 30) return "sweating";
  if (resources.food < 35 || resources.energy < 30) return "worried";
  if (resources.science >= 40 && resources.oxygen > 55) return "cheering";
  if (resources.energy < 45) return "tired";
  if (resources.shielding < 40) return "focused";
  return "happy";
}

export function updateModuleStatuses(
  modules: ModuleState[],
  allocation: PowerAllocation,
  resources: Resources,
): ModuleState[] {
  return modules.map((mod) => {
    const power = allocation[mod.id];
    let status: ModuleState["status"] = "online";
    if (power <= 0) status = "offline";
    else if (power === 1 || resources.energy < 25) status = "strained";
    return { ...mod, status };
  });
}

export function powerGenerated(
  allocation: PowerAllocation,
  planet: Planet,
  day: number,
): number {
  const base = 4 + allocation.power * 1.5;
  if (planet === "mars" && isMarsDustDay(day)) return Math.round(base * 0.55);
  if (planet === "moon" && isMoonNight(day)) return Math.round(base * 0.7);
  return Math.round(base);
}

export function buildDayLog(args: {
  day: number;
  planet: Planet;
  allocation: PowerAllocation;
  resourcesAfter: Resources;
  eventTitle?: string;
  choiceLabel?: string;
  effectsApplied: Partial<Resources>;
}): DayLogEntry {
  const weakest = getWeakestResource(args.resourcesAfter);
  const fact =
    nasaData.osdrFacts[(args.day - 1) % nasaData.osdrFacts.length];
  const generated = powerGenerated(args.allocation, args.planet, args.day);

  const samiLines = [
    `Day ${args.day}: We steered ${POWER_BUDGET} power units like a team.`,
    `I watched the meters closely—${RESOURCE_META[weakest].label} needs love.`,
    `NOVA asked hard questions. I think we chose thoughtfully.`,
    `Out here, every trade-off teaches us something new.`,
  ];

  return {
    day: args.day,
    planet: args.planet,
    powerUsed: { ...args.allocation },
    powerGenerated: generated,
    resourcesAfter: { ...args.resourcesAfter },
    eventTitle: args.eventTitle,
    choiceLabel: args.choiceLabel,
    effectsApplied: args.effectsApplied,
    nasaFact: fact,
    weakestResource: weakest,
    samiLine: samiLines[args.day % samiLines.length],
  };
}

export function computeStars(history: Resources[], won: boolean): number {
  if (!won) return 1;
  if (history.length === 0) return 2;
  const last = history[history.length - 1];
  const avg =
    (last.energy + last.water + last.oxygen + last.food + last.shielding) / 5;
  if (avg >= 60 && last.science >= 40) return 3;
  if (avg >= 45) return 2;
  return 1;
}

export function formatDelta(delta: Partial<Resources>): string {
  return (Object.keys(delta) as ResourceKey[])
    .map((key) => {
      const value = delta[key] ?? 0;
      if (value === 0) return null;
      const sign = value > 0 ? "+" : "";
      return `${sign}${value} ${RESOURCE_META[key].label}`;
    })
    .filter(Boolean)
    .join(", ");
}

export function dayLabel(planet: Planet, day: number): string {
  return planet === "mars" ? `Sol ${day}` : `Day ${day}`;
}

const GROWTH_ORDER = ["seed", "sprout", "growing", "ready"] as const;

/** Runs every morning: watered crops grow one stage, thirsty ones can wilt. */
export function growPlots(plots: CropPlot[]): CropPlot[] {
  return plots.map((plot): CropPlot => {
    if (plot.stage === "empty" || plot.stage === "wilted" || plot.stage === "ready") {
      return { ...plot, watered: false };
    }
    if (plot.watered) {
      const next = GROWTH_ORDER[GROWTH_ORDER.indexOf(plot.stage) + 1];
      return { stage: next, watered: false, thirst: 0 };
    }
    const thirst = plot.thirst + 1;
    if (thirst >= 2) return { stage: "wilted", watered: false, thirst };
    return { ...plot, watered: false, thirst };
  });
}
