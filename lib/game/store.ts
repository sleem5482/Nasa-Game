"use client";

import { create } from "zustand";
import {
  DEFAULT_BASE_NAME,
  DEFAULT_SYSTEMS,
  DIFFICULTY_START,
  MISSION_LENGTH,
  RESOURCE_ORDER,
  SYSTEM_BY_ID,
} from "./constants";
import { archived, isoDate } from "./dataSource";
import {
  applyDelta,
  buildRescueOptions,
  clampMeter,
  computeStars,
  defaultSystemPlan,
  resolveDay,
} from "./engine";
import { pickEventForDay } from "./spaceWeather";
import type {
  DecisionChoice,
  Difficulty,
  GameSnapshot,
  Planet,
  RescueOption,
  ResourceKey,
  Resources,
  SamiMood,
  Screen,
  SpaceWeatherState,
  SystemId,
} from "./types";

type GameActions = {
  setPlayerName: (name: string) => void;
  setBaseName: (name: string) => void;
  setScreen: (screen: Screen) => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  toggleScienceLibrary: (open?: boolean) => void;
  toggleComicBook: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  selectPlanet: (planet: Planet) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  startMission: (bonuses?: Partial<Resources>) => void;
  startBriefing: () => void;
  openDecision: () => void;
  chooseStrategy: (choice: DecisionChoice) => void;
  setSystem: (id: SystemId, on: boolean) => void;
  confirmPowerPlan: () => void;
  continueFromResults: () => void;
  applyRescue: (optionId: string) => void;
  loadSpaceWeather: () => Promise<void>;
  replay: () => void;
};

export type GameStore = GameSnapshot & GameActions;

function moodFor(resources: Resources): SamiMood {
  const values = RESOURCE_ORDER.map((key) => resources[key]);
  const lowest = Math.min(...values);
  if (lowest <= 0) return "sweating";
  if (lowest < 20) return "worried";
  if (lowest < 35) return "focused";
  if (lowest >= 65) return "cheering";
  if (resources.lifeSupport < 50) return "worried";
  return "happy";
}

const baseState = (): GameSnapshot => ({
  playerName: "",
  baseName: DEFAULT_BASE_NAME,
  day: 1,
  planet: null,
  difficulty: "normal",
  missionLength: MISSION_LENGTH,
  resources: { ...DIFFICULTY_START.normal },
  systems: defaultSystemPlan(),
  screen: "title",
  activeEvent: null,
  chosenChoice: null,
  lastResult: null,
  history: [{ ...DIFFICULTY_START.normal }],
  decisions: [],
  rescueUsed: false,
  rescueOptions: [],
  won: null,
  stars: 0,
  accessibility: { largeText: false, reducedMotion: false },
  showScienceLibrary: false,
  showComicBook: false,
  showSettings: false,
  scienceUnlocked: [],
  spaceWeather: null,
  samiMood: "happy",
});

export const useGameStore = create<GameStore>((set, get) => {
  /** Move to the next day, or close the mission if today was the last one. */
  const advanceDay = () => {
    const state = get();
    if (state.day >= state.missionLength) {
      const stars = computeStars(state.resources, true, state.rescueUsed);
      set({
        screen: "debrief",
        won: true,
        stars,
        samiMood: stars === 3 ? "cheering" : "happy",
      });
      return;
    }
    set({
      day: state.day + 1,
      screen: "day",
      activeEvent: null,
      chosenChoice: null,
      // Keep yesterday's result so the day screen can explain what changed.
      lastResult: state.lastResult,
      rescueOptions: [],
      // Power plans last for one day; each morning the crew restarts from the
      // safe default so an old plan cannot quietly weaken the base.
      systems: defaultSystemPlan(),
      samiMood: moodFor(state.resources),
    });
  };

  /** Shared by choices with and without a power plan. */
  const finishDay = (choice: DecisionChoice, systems: GameSnapshot["systems"]) => {
    const state = get();
    if (!state.planet || !state.activeEvent) return;

    const result = resolveDay({
      day: state.day,
      planet: state.planet,
      resources: state.resources,
      choice,
      plan: systems,
    });
    result.eventTitle = state.activeEvent.title;

    const decisions = [
      ...state.decisions,
      {
        day: state.day,
        eventId: state.activeEvent.id,
        eventTitle: state.activeEvent.title,
        choiceId: choice.id,
        choiceLabel: choice.label,
        tags: choice.tags,
        systems,
      },
    ];
    const history = [...state.history, result.after];
    const zeroed = result.rescueNeeded;

    set({
      resources: result.after,
      systems,
      lastResult: result,
      decisions,
      history,
      chosenChoice: choice,
      screen: "results",
      rescueOptions:
        zeroed && !state.rescueUsed
          ? buildRescueOptions(result.after, zeroed)
          : [],
      samiMood: moodFor(result.after),
      scienceUnlocked: state.activeEvent.nasaTag
        ? Array.from(new Set([...state.scienceUnlocked, state.activeEvent.nasaTag]))
        : state.scienceUnlocked,
    });
  };

  return {
    ...baseState(),

    setPlayerName: (playerName) => set({ playerName }),

    setBaseName: (baseName) => set({ baseName }),

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

    toggleComicBook: (open) =>
      set((s) => ({
        showComicBook: typeof open === "boolean" ? open : !s.showComicBook,
      })),

    toggleSettings: (open) =>
      set((s) => ({
        showSettings: typeof open === "boolean" ? open : !s.showSettings,
      })),

    selectPlanet: (planet) => set({ planet }),

    setDifficulty: (difficulty) => set({ difficulty }),

    startMission: (bonuses) => {
      const { planet, difficulty, playerName, baseName } = get();
      if (!planet) return;
      const start = applyDelta({ ...DIFFICULTY_START[difficulty] }, bonuses ?? {});
      set({
        ...baseState(),
        playerName,
        baseName: baseName.trim() || DEFAULT_BASE_NAME,
        planet,
        difficulty,
        resources: start,
        history: [{ ...start }],
        screen: "day",
        systems: defaultSystemPlan(),
        samiMood: "happy",
      });
      void get().loadSpaceWeather();
    },

    startBriefing: () => {
      const state = get();
      if (!state.planet) return;
      if (state.activeEvent) {
        set({ screen: "event" });
        return;
      }
      const event = pickEventForDay({
        planet: state.planet,
        day: state.day,
        missionLength: state.missionLength,
        decisions: state.decisions,
        sw: state.spaceWeather,
      });
      set({
        activeEvent: event,
        chosenChoice: null,
        rescueOptions: [],
        screen: "event",
      });
    },

    openDecision: () => set({ screen: "decision" }),

    chooseStrategy: (choice) => {
      const state = get();
      if (!state.activeEvent) return;
      if (choice.requiresPowerPlan) {
        set({ chosenChoice: choice, screen: "execute" });
        return;
      }
      finishDay(choice, state.systems);
    },

    setSystem: (id, on) => {
      const system = SYSTEM_BY_ID[id];
      if (!system) return;
      if (system.essential && !on) return;
      set((s) => ({ systems: { ...s.systems, [id]: on } }));
    },

    confirmPowerPlan: () => {
      const state = get();
      if (!state.chosenChoice) return;
      finishDay(state.chosenChoice, state.systems);
    },

    continueFromResults: () => {
      const state = get();
      if (state.lastResult?.rescueNeeded) {
        const hasSafeOption = state.rescueOptions.some((option) => option.safe);
        if (!state.rescueUsed && hasSafeOption) {
          set({ screen: "rescue" });
          return;
        }
        set({ screen: "debrief", won: false, stars: 1, samiMood: "tired" });
        return;
      }
      advanceDay();
    },

    applyRescue: (optionId) => {
      const state = get();
      const option: RescueOption | undefined = state.rescueOptions.find(
        (candidate) => candidate.id === optionId,
      );
      if (!option || !option.safe || state.rescueUsed) return;

      const resources = applyDelta(state.resources, option.effects);
      const stillZero = RESOURCE_ORDER.some((key) => resources[key] <= 0);

      set({
        resources,
        history: [...state.history, resources],
        rescueUsed: true,
        rescueOptions: [],
        lastResult: state.lastResult
          ? { ...state.lastResult, after: resources, rescueNeeded: null }
          : null,
        samiMood: moodFor(resources),
      });

      if (stillZero) {
        set({ screen: "debrief", won: false, stars: 1, samiMood: "tired" });
        return;
      }
      advanceDay();
    },

    loadSpaceWeather: async () => {
      try {
        const response = await fetch("/api/space-weather");
        if (!response.ok) throw new Error(`space-weather ${response.status}`);
        const data = (await response.json()) as SpaceWeatherState;
        set({ spaceWeather: data });
      } catch {
        set({
          spaceWeather: {
            source: archived("DONKI"),
            startDate: isoDate(new Date()),
            events: [],
            failed: true,
          },
        });
      }
    },

    replay: () =>
      set({
        ...baseState(),
        playerName: get().playerName,
        baseName: get().baseName,
        accessibility: get().accessibility,
      }),
  };
});

export function meterValue(resources: Resources, key: ResourceKey): number {
  return clampMeter(resources[key]);
}
