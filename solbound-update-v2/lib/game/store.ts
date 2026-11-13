"use client";

import { create } from "zustand";
import {
  DIFFICULTY_START,
  EMPTY_ALLOCATION,
  HARVEST_FOOD,
  INITIAL_MODULES,
  INITIAL_PLOTS,
  INITIAL_RESOURCES,
  isMarsDustDay,
  isMoonNight,
  MISSION_LENGTH,
  NOVA_TIPS,
  PLANT_WATER_COST,
  POWER_BUDGET,
  UPGRADE_COST,
  WATER_PER_BED,
} from "./constants";
import { pickDailyEvent } from "./events";
import {
  allocationTotal,
  applyResourceDelta,
  buildDayLog,
  computeStars,
  deriveSamiMood,
  getWeakestResource,
  growPlots,
  previewEffects,
  updateModuleStatuses,
} from "./dayLogic";
import { CREW_ACTIONS_PER_DAY, MODULE_ACTIONS } from "./moduleActions";
import type {
  AccessibilitySettings,
  Difficulty,
  CrewChoice,
  EventChoice,
  GameSnapshot,
  ModuleAction,
  ModuleId,
  Planet,
  PowerAllocation,
  ResourceKey,
} from "./types";

type GameActions = {
  setPlayerName: (name: string) => void;
  setScreen: (screen: GameSnapshot["screen"]) => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  toggleScienceLibrary: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  openModule: (id: ModuleId | null) => void;
  toggleMissionControl: (open?: boolean) => void;
  openDailyLogReview: () => void;
  selectPlanet: (planet: Planet) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  startMission: () => void;
  setAllocation: (module: ModuleId, value: number) => void;
  autoBalance: () => void;
  beginEndDay: () => void;
  resolveEventChoice: (choice: EventChoice) => void;
  closeComicContinue: () => void;
  upgradeModule: (id: ModuleId) => void;
  performModuleAction: (actionId: string) => boolean;
  applyCrewChoice: (choice: CrewChoice) => boolean;
  plantPlot: (index: number) => boolean;
  waterPlots: () => boolean;
  harvestPlot: (index: number) => boolean;
  replay: () => void;
  getPreview: () => Partial<GameSnapshot["resources"]>;
  remainingPower: () => number;
};

export type GameStore = GameSnapshot & GameActions;

function startingResources(difficulty: Difficulty): GameSnapshot["resources"] {
  const mult = DIFFICULTY_START[difficulty];
  return {
    energy: Math.round(INITIAL_RESOURCES.energy * mult),
    water: Math.round(INITIAL_RESOURCES.water * mult),
    oxygen: Math.round(INITIAL_RESOURCES.oxygen * mult),
    food: Math.round(INITIAL_RESOURCES.food * mult),
    shielding: Math.round(INITIAL_RESOURCES.shielding * mult),
    science: INITIAL_RESOURCES.science,
  };
}

const baseState = (): GameSnapshot => ({
  playerName: "",
  day: 1,
  planet: null,
  difficulty: "normal",
  missionLength: MISSION_LENGTH,
  resources: { ...INITIAL_RESOURCES },
  modules: INITIAL_MODULES.map((m) => ({ ...m })),
  powerBudget: POWER_BUDGET,
  allocation: { ...EMPTY_ALLOCATION },
  screen: "title",
  activeEvent: null,
  pendingEventChoice: null,
  dayLogs: [],
  history: [{ ...INITIAL_RESOURCES }],
  alerts: [
    {
      id: "welcome",
      tone: "info",
      message: "Welcome, Junior Astronaut. Keep every meter out of the red!",
    },
  ],
  samiMood: "happy",
  novaTip: NOVA_TIPS[0],
  scienceUnlocked: [],
  won: null,
  stars: 0,
  accessibility: { largeText: false, reducedMotion: false },
  showScienceLibrary: false,
  showSettings: false,
  showModuleId: null,
  showMissionControl: false,
  crewActionsRemaining: CREW_ACTIONS_PER_DAY,
  missionActivity: [],
  comicMode: "resolve",
  plots: INITIAL_PLOTS.map((p) => ({ ...p })),
});

function buildAlerts(
  resources: GameSnapshot["resources"],
  planet: Planet,
  day: number,
): GameSnapshot["alerts"] {
  const alerts: GameSnapshot["alerts"] = [];
  (Object.keys(resources) as ResourceKey[]).forEach((key) => {
    if (key === "science") return;
    if (resources[key] < 25) {
      alerts.push({
        id: `${key}-crit`,
        tone: "critical",
        message: `${key[0].toUpperCase()}${key.slice(1)} is critically low!`,
      });
    } else if (resources[key] < 40) {
      alerts.push({
        id: `${key}-warn`,
        tone: "warn",
        message: `${key[0].toUpperCase()}${key.slice(1)} needs attention soon.`,
      });
    }
  });
  if (planet === "moon" && isMoonNight(day)) {
    alerts.push({
      id: "lunar-night",
      tone: "warn",
      message: "Long lunar night: heaters and batteries work overtime.",
    });
  }
  if (planet === "mars" && isMarsDustDay(day)) {
    alerts.push({
      id: "dust-day",
      tone: "warn",
      message: "Dusty skies today—solar panels may underperform.",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "stable",
      tone: "info",
      message: "Base systems look steady. Nice flying, Sami!",
    });
  }
  return alerts.slice(0, 4);
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...baseState(),

  setPlayerName: (playerName) => set({ playerName }),

  setScreen: (screen) => set({ screen }),

  toggleLargeText: () =>
    set((s) => ({
      accessibility: {
        ...s.accessibility,
        largeText: !s.accessibility.largeText,
      },
    })),

  toggleReducedMotion: () =>
    set((s) => ({
      accessibility: {
        ...s.accessibility,
        reducedMotion: !s.accessibility.reducedMotion,
      },
    })),

  toggleScienceLibrary: (open) =>
    set((s) => ({
      showScienceLibrary:
        typeof open === "boolean" ? open : !s.showScienceLibrary,
    })),

  toggleSettings: (open) =>
    set((s) => ({
      showSettings: typeof open === "boolean" ? open : !s.showSettings,
    })),

  openModule: (id) => set({ showModuleId: id }),

  toggleMissionControl: (open) =>
    set((state) => ({
      showMissionControl:
        typeof open === "boolean" ? open : !state.showMissionControl,
      showModuleId: null,
    })),

  openDailyLogReview: () => {
    if (get().dayLogs.length === 0) return;
    set({ screen: "comic", comicMode: "review" });
  },

  selectPlanet: (planet) =>
    set({
      planet,
      novaTip:
        planet === "mars"
          ? "Mars has dusty skies and delayed Earth calls. Budget carefully!"
          : "Moon nights last ~14 Earth days. Save power for warmth!",
    }),

  setDifficulty: (difficulty) => set({ difficulty }),

  startMission: () => {
    const { planet, difficulty } = get();
    if (!planet) return;
    const resources = startingResources(difficulty);
    set({
      screen: "dashboard",
      day: 1,
      resources,
      modules: INITIAL_MODULES.map((m) => ({ ...m })),
      allocation: { ...EMPTY_ALLOCATION },
      dayLogs: [],
      history: [{ ...resources }],
      won: null,
      stars: 0,
      samiMood: "happy",
      alerts: buildAlerts(resources, planet, 1),
      novaTip: NOVA_TIPS[1],
      crewActionsRemaining: CREW_ACTIONS_PER_DAY,
      missionActivity: [],
      showMissionControl: false,
      plots: INITIAL_PLOTS.map((p) => ({ ...p })),
    });
  },

  setAllocation: (module, value) => {
    const state = get();
    const nextValue = Math.max(0, Math.min(POWER_BUDGET, Math.round(value)));
    const draft: PowerAllocation = { ...state.allocation, [module]: nextValue };
    const total = allocationTotal(draft);
    if (total > POWER_BUDGET) {
      // Shrink other modules proportionally-ish by pulling from the largest other
      let overflow = total - POWER_BUDGET;
      const others = (Object.keys(draft) as ModuleId[]).filter(
        (id) => id !== module,
      );
      for (const id of others) {
        if (overflow <= 0) break;
        const take = Math.min(draft[id], overflow);
        draft[id] -= take;
        overflow -= take;
      }
    }
    set({ allocation: draft });
  },

  autoBalance: () =>
    set({
      allocation: { habitat: 3, greenhouse: 2, power: 2, shelter: 2, lab: 1 },
    }),

  getPreview: () => {
    const { allocation, planet } = get();
    if (!planet) return {};
    return previewEffects(allocation, planet);
  },

  remainingPower: () => POWER_BUDGET - allocationTotal(get().allocation),

  beginEndDay: () => {
    const { planet, day, allocation } = get();
    if (!planet) return;
    if (allocationTotal(allocation) !== POWER_BUDGET) return;
    const event = pickDailyEvent(planet, day);
    set({
      activeEvent: event,
      pendingEventChoice: null,
      screen: "event",
      novaTip: "Read each choice. What are you trading away?",
    });
  },

  resolveEventChoice: (choice) => {
    const state = get();
    if (!state.planet || !state.activeEvent) return;

    const powerDelta = previewEffects(state.allocation, state.planet);
    const combined: Partial<GameSnapshot["resources"]> = { ...powerDelta };
    (Object.keys(choice.effects) as ResourceKey[]).forEach((key) => {
      combined[key] = (combined[key] ?? 0) + (choice.effects[key] ?? 0);
    });

    // Module level bonuses
    state.modules.forEach((mod) => {
      const bonus = (mod.level - 1) * 1.5;
      if (mod.id === "habitat") combined.oxygen = (combined.oxygen ?? 0) + bonus;
      if (mod.id === "greenhouse") combined.food = (combined.food ?? 0) + bonus;
      if (mod.id === "power") combined.energy = (combined.energy ?? 0) + bonus;
      if (mod.id === "shelter")
        combined.shielding = (combined.shielding ?? 0) + bonus;
      if (mod.id === "lab") combined.science = (combined.science ?? 0) + bonus;
    });

    let resources = applyResourceDelta(state.resources, combined);
    const modules = updateModuleStatuses(
      state.modules,
      state.allocation,
      resources,
    );
    const log = buildDayLog({
      day: state.day,
      planet: state.planet,
      allocation: state.allocation,
      resourcesAfter: resources,
      eventTitle: state.activeEvent.title,
      choiceLabel: choice.label,
      effectsApplied: combined,
    });

    const failed = (["energy", "water", "oxygen", "food", "shielding"] as const).some(
      (key) => resources[key] <= 0,
    );

    set({
      resources,
      modules,
      samiMood: deriveSamiMood(resources),
      pendingEventChoice: choice,
      dayLogs: [...state.dayLogs, log],
      history: [...state.history, resources],
      alerts: buildAlerts(resources, state.planet, state.day),
      novaTip: choice.novaHint,
      scienceUnlocked: Array.from(
        new Set([
          ...state.scienceUnlocked,
          state.activeEvent.nasaTag ?? "NASA mission insight",
        ]),
      ),
      screen: "comic",
      comicMode: "resolve",
      won: failed ? false : null,
      activeEvent: state.activeEvent,
      missionActivity: [
        ...state.missionActivity,
        {
          id: `event-${state.day}-${state.missionActivity.length}`,
          day: state.day,
          title: choice.label,
          detail: state.activeEvent.title,
        },
      ],
    });
  },

  closeComicContinue: () => {
    const state = get();
    if (!state.planet) return;

    if (state.comicMode === "review") {
      set({ screen: "dashboard", comicMode: "resolve" });
      return;
    }

    if (state.won === false) {
      set({
        screen: "debrief",
        stars: 1,
        samiMood: "tired",
        novaTip:
          "Failure teaches. Look at which meter hit zero—and what you traded for it.",
      });
      return;
    }

    const nextDay = state.day + 1;
    if (nextDay > state.missionLength) {
      const stars = computeStars(state.history, true);
      set({
        screen: "debrief",
        won: true,
        stars,
        samiMood: "cheering",
        novaTip: "Mission complete! You balanced trade-offs like a real crew.",
      });
      return;
    }

    set({
      day: nextDay,
      screen: "dashboard",
      showModuleId: null,
      showMissionControl: false,
      crewActionsRemaining: CREW_ACTIONS_PER_DAY,
      missionActivity: [
        ...state.missionActivity,
        {
          id: `day-${nextDay}-started`,
          day: nextDay,
          title: `${state.planet === "mars" ? "Sol" : "Day"} ${nextDay} started`,
          detail: "Systems check complete · crew actions restored",
        },
      ],
      activeEvent: null,
      pendingEventChoice: null,
      plots: growPlots(state.plots),
      allocation: { ...EMPTY_ALLOCATION },
      novaTip: NOVA_TIPS[nextDay % NOVA_TIPS.length],
      alerts: buildAlerts(state.resources, state.planet, nextDay),
      samiMood: deriveSamiMood(state.resources),
    });
  },

  upgradeModule: (id) => {
    const state = get();
    const mod = state.modules.find((m) => m.id === id);
    if (!mod || mod.level >= mod.maxLevel) return;
    if (state.resources.science < UPGRADE_COST) return;

    const modules = state.modules.map((m) =>
      m.id === id ? { ...m, level: m.level + 1 } : m,
    );
    const resources = {
      ...state.resources,
      science: state.resources.science - UPGRADE_COST,
    };
    set({
      modules,
      resources,
      samiMood: "cheering",
      novaTip: `${mod.name} leveled up! Stronger modules soften future trade-offs.`,
      showModuleId: id,
    });
  },

  performModuleAction: (actionId) => {
    const state = get();
    const action: ModuleAction | undefined = Object.values(MODULE_ACTIONS)
      .flat()
      .find((candidate) => candidate.id === actionId);

    if (!action) return false;
    if (!state.modules.some((module) => module.id === action.moduleId)) return false;
    return get().applyCrewChoice(action);
  },

  // Shared by the quick action buttons AND the interactive module scenes.
  applyCrewChoice: (choice) => {
    const state = get();
    if (state.crewActionsRemaining <= 0) return false;

    const canAfford = (Object.keys(choice.effects) as ResourceKey[]).every(
      (key) => state.resources[key] + (choice.effects[key] ?? 0) >= 0,
    );
    if (!canAfford) return false;

    const resources = applyResourceDelta(state.resources, choice.effects);
    set({
      resources,
      crewActionsRemaining: state.crewActionsRemaining - 1,
      alerts: state.planet
        ? buildAlerts(resources, state.planet, state.day)
        : state.alerts,
      samiMood: deriveSamiMood(resources),
      novaTip: choice.coachNote,
      missionActivity: [
        ...state.missionActivity,
        {
          id: `action-${state.day}-${state.missionActivity.length}`,
          day: state.day,
          title: choice.title,
          detail: formatActivityEffects(choice.effects),
        },
      ],
    });
    return true;
  },

  plantPlot: (index) => {
    const state = get();
    const plot = state.plots[index];
    if (!plot || (plot.stage !== "empty" && plot.stage !== "wilted")) return false;
    if (state.crewActionsRemaining <= 0) return false;
    if (state.resources.water < PLANT_WATER_COST) return false;

    const resources = applyResourceDelta(state.resources, { water: -PLANT_WATER_COST });
    const plots = state.plots.map((p, i) =>
      i === index ? { stage: "seed" as const, watered: true, thirst: 0 } : p,
    );
    set({
      resources,
      plots,
      crewActionsRemaining: state.crewActionsRemaining - 1,
      alerts: state.planet ? buildAlerts(resources, state.planet, state.day) : state.alerts,
      samiMood: deriveSamiMood(resources),
      novaTip: "Seeds need water every day. Skip two days and they wilt!",
      missionActivity: [
        ...state.missionActivity,
        {
          id: `plant-${state.day}-${state.missionActivity.length}`,
          day: state.day,
          title: "Planted a new crop",
          detail: `-${PLANT_WATER_COST} water`,
        },
      ],
    });
    return true;
  },

  waterPlots: () => {
    const state = get();
    const thirsty = state.plots.filter(
      (p) =>
        (p.stage === "seed" || p.stage === "sprout" || p.stage === "growing") &&
        !p.watered,
    );
    if (thirsty.length === 0 || state.crewActionsRemaining <= 0) return false;
    const cost = thirsty.length * WATER_PER_BED;
    if (state.resources.water < cost) return false;

    const resources = applyResourceDelta(state.resources, { water: -cost });
    const plots = state.plots.map((p) =>
      (p.stage === "seed" || p.stage === "sprout" || p.stage === "growing") && !p.watered
        ? { ...p, watered: true }
        : p,
    );
    set({
      resources,
      plots,
      crewActionsRemaining: state.crewActionsRemaining - 1,
      alerts: state.planet ? buildAlerts(resources, state.planet, state.day) : state.alerts,
      samiMood: deriveSamiMood(resources),
      novaTip: "Watered crops grow a stage every morning. Water is precious, though!",
      missionActivity: [
        ...state.missionActivity,
        {
          id: `water-${state.day}-${state.missionActivity.length}`,
          day: state.day,
          title: "Watered the beds",
          detail: `-${cost} water`,
        },
      ],
    });
    return true;
  },

  harvestPlot: (index) => {
    const state = get();
    const plot = state.plots[index];
    if (!plot || plot.stage !== "ready" || state.crewActionsRemaining <= 0) return false;

    const resources = applyResourceDelta(state.resources, { food: HARVEST_FOOD });
    const plots = state.plots.map((p, i) =>
      i === index ? { stage: "empty" as const, watered: false, thirst: 0 } : p,
    );
    set({
      resources,
      plots,
      crewActionsRemaining: state.crewActionsRemaining - 1,
      alerts: state.planet ? buildAlerts(resources, state.planet, state.day) : state.alerts,
      samiMood: deriveSamiMood(resources),
      novaTip: "Fresh harvest! Plant the empty bed again to keep the food coming.",
      missionActivity: [
        ...state.missionActivity,
        {
          id: `harvest-${state.day}-${state.missionActivity.length}`,
          day: state.day,
          title: "Harvested a crop",
          detail: `+${HARVEST_FOOD} food`,
        },
      ],
    });
    return true;
  },

  replay: () =>
    set({
      ...baseState(),
      playerName: get().playerName,
      accessibility: get().accessibility,
    }),
}));

function formatActivityEffects(
  effects: Partial<GameSnapshot["resources"]>,
): string {
  return (Object.entries(effects) as [ResourceKey, number][])
    .map(([key, value]) => `${value > 0 ? "+" : ""}${value} ${key}`)
    .join(" · ");
}

export function useAccessibility(): AccessibilitySettings {
  return useGameStore((s) => s.accessibility);
}

export function weakestLabel(resources: GameSnapshot["resources"]): string {
  const key = getWeakestResource(resources);
  return key;
}
