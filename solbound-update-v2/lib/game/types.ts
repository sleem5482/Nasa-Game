export type Planet = "moon" | "mars";

export type Difficulty = "easy" | "normal" | "expert";

export type Screen =
  | "title"
  | "briefing"
  | "dashboard"
  | "event"
  | "comic"
  | "debrief";

export type ResourceKey =
  | "energy"
  | "water"
  | "oxygen"
  | "food"
  | "shielding"
  | "science";

export type Resources = Record<ResourceKey, number>;

export type ModuleId =
  | "habitat"
  | "greenhouse"
  | "power"
  | "shelter"
  | "lab";

export type PowerAllocation = Record<ModuleId, number>;

export type CrewId = "amara" | "chen" | "ortiz" | "sami" | "nova";

export type SamiMood =
  | "happy"
  | "focused"
  | "worried"
  | "sweating"
  | "cheering"
  | "tired";

export interface ModuleState {
  id: ModuleId;
  name: string;
  level: number;
  maxLevel: number;
  status: "online" | "strained" | "offline";
  description: string;
}

export interface ModuleAction {
  id: string;
  moduleId: ModuleId;
  title: string;
  description: string;
  effects: Partial<Resources>;
  coachNote: string;
}

/** A one-off crew decision from an interactive module scene. */
export type CrewChoice = Pick<ModuleAction, "id" | "title" | "effects" | "coachNote">;

export interface MissionActivity {
  id: string;
  day: number;
  title: string;
  detail: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effects: Partial<Resources>;
  novaHint: string;
}

export interface GameEvent {
  id: string;
  title: string;
  crew: CrewId;
  planet?: Planet | "both";
  story: string;
  choices: EventChoice[];
  nasaTag?: string;
}

export interface DayLogEntry {
  day: number;
  planet: Planet;
  powerUsed: PowerAllocation;
  powerGenerated: number;
  resourcesAfter: Resources;
  eventTitle?: string;
  choiceLabel?: string;
  effectsApplied: Partial<Resources>;
  nasaFact: string;
  weakestResource: ResourceKey;
  samiLine: string;
}

export interface Alert {
  id: string;
  tone: "info" | "warn" | "critical";
  message: string;
}

export type PlotStage = "empty" | "seed" | "sprout" | "growing" | "ready" | "wilted";

/** One planting bed in the greenhouse */
export interface CropPlot {
  stage: PlotStage;
  /** watered today? (reset every morning) */
  watered: boolean;
  /** days in a row without water */
  thirst: number;
}

export interface AccessibilitySettings {
  largeText: boolean;
  reducedMotion: boolean;
}

export interface GameSnapshot {
  playerName: string;
  day: number;
  planet: Planet | null;
  difficulty: Difficulty;
  missionLength: number;
  resources: Resources;
  modules: ModuleState[];
  powerBudget: number;
  allocation: PowerAllocation;
  screen: Screen;
  activeEvent: GameEvent | null;
  pendingEventChoice: EventChoice | null;
  dayLogs: DayLogEntry[];
  history: Resources[];
  alerts: Alert[];
  samiMood: SamiMood;
  novaTip: string;
  scienceUnlocked: string[];
  won: boolean | null;
  stars: number;
  accessibility: AccessibilitySettings;
  showScienceLibrary: boolean;
  showSettings: boolean;
  showModuleId: ModuleId | null;
  showMissionControl: boolean;
  crewActionsRemaining: number;
  missionActivity: MissionActivity[];
  comicMode: "resolve" | "review";
  plots: CropPlot[];
}
