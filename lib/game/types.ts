export type Planet = "moon" | "mars";

export type Difficulty = "easy" | "normal" | "expert";

/**
 * The three meters the player manages. Everything in the game is expressed in
 * these numbers so a young captain can hold the whole base in their head.
 */
export type ResourceKey = "lifeSupport" | "power" | "protection";

export type Resources = Record<ResourceKey, number>;

export type Screen =
  | "title"
  | "briefing"
  | "setup"
  | "day"
  | "event"
  | "decision"
  | "execute"
  | "results"
  | "rescue"
  | "debrief";

export type CrewId = "amara" | "chen" | "ortiz" | "sami" | "nova";

export type SamiMood =
  | "happy"
  | "focused"
  | "worried"
  | "sweating"
  | "cheering"
  | "tired";

/** Every real-world fact in the game carries one of these labels. */
export interface DataSource {
  mode: "live" | "archived";
  /** yyyy-mm-dd of the data (or "yyyy-mm-dd – yyyy-mm-dd" for a period). */
  date: string;
  /** Short name of the dataset, e.g. "DONKI". */
  name: string;
}

export type EventSeverity = "minor" | "strong" | "extreme";

export interface SpaceWeatherEvent {
  id: string;
  kind: "flare" | "cme";
  /** ISO time of the event (flare peak, or CME start). */
  time: string;
  classType?: string;
  speedKmS?: number;
  severity: EventSeverity;
  link?: string;
}

export interface SpaceWeatherState {
  source: DataSource;
  /** yyyy-mm-dd of mission day 1. Day N is this date + N - 1. */
  startDate: string;
  events: SpaceWeatherEvent[];
  /** True when the live call failed and the hand-written events are used. */
  failed?: boolean;
}

/* ------------------------------------------------------------------ */
/* Outpost systems (stage 4 of the loop)                               */
/* ------------------------------------------------------------------ */

export type SystemId = "oxygen" | "greenhouse" | "lab" | "lights";

/** Which systems the crew keeps running today. */
export type SystemPlan = Record<SystemId, boolean>;

export interface OutpostSystem {
  id: SystemId;
  name: string;
  /** One short line a child can read. */
  summary: string;
  /** Power removed from the batteries while this system runs. */
  powerCost: number;
  /** Essential systems cannot be switched off. */
  essential: boolean;
  /** Applied when the system runs. */
  effects: Partial<Resources>;
  /** Applied when the system is stopped. */
  offEffects?: Partial<Resources>;
  icon: "wind" | "leaf" | "flask" | "bulb";
}

/* ------------------------------------------------------------------ */
/* Events and decisions                                                */
/* ------------------------------------------------------------------ */

export interface DecisionChoice {
  id: string;
  label: string;
  /** What the crew will actually do. */
  description: string;
  /** The good part of the trade-off. */
  upside: string;
  /** The cost of the trade-off. */
  downside: string;
  effects: Partial<Resources>;
  /** One sentence NOVA says after the result. */
  lesson: string;
  /** The single idea the child should remember. */
  takeaway: string;
  /** Memory tags: future events can react to these. */
  tags: string[];
  /** When true the player also chooses which systems keep running. */
  requiresPowerPlan?: boolean;
}

export interface GameEvent {
  id: string;
  title: string;
  kind: "warning" | "opportunity" | "info";
  crew: CrewId;
  planet?: Planet | "both";
  /** NOVA explains what is happening. */
  story: string;
  /** "What could happen?" bullets, shown before any choice. */
  impacts: string[];
  choices: DecisionChoice[];
  nasaTag?: string;
  /** Plain-language fact about the real event, shown in the event card. */
  realFact?: string;
  /** Which hand-written event's picture to reuse (DONKI events have generated ids). */
  imageKey?: string;
  severity?: EventSeverity;
  /** Where the event came from. Hand-written events have no source. */
  source?: DataSource;
}

export type BreakdownStep = {
  label: string;
  delta: Partial<Resources>;
};

export interface DayResult {
  day: number;
  eventTitle: string;
  choiceLabel: string;
  before: Resources;
  after: Resources;
  steps: BreakdownStep[];
  lesson: string;
  takeaway: string;
  systems: SystemPlan;
  tone: "great" | "ok" | "danger";
  /** The first meter that reached zero, if any. */
  rescueNeeded: ResourceKey | null;
}

export interface DecisionRecord {
  day: number;
  eventId: string;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  tags: string[];
  systems: SystemPlan;
}

export interface RescueOption {
  id: string;
  label: string;
  description: string;
  effects: Partial<Resources>;
  /** Disabled when the cost would empty another essential meter. */
  safe: boolean;
}

export interface AccessibilitySettings {
  largeText: boolean;
  reducedMotion: boolean;
}

export interface GameSnapshot {
  playerName: string;
  baseName: string;
  day: number;
  planet: Planet | null;
  difficulty: Difficulty;
  missionLength: number;
  resources: Resources;
  /** The plan the crew runs today; reset each morning to the safe default. */
  systems: SystemPlan;
  screen: Screen;
  activeEvent: GameEvent | null;
  chosenChoice: DecisionChoice | null;
  lastResult: DayResult | null;
  history: Resources[];
  decisions: DecisionRecord[];
  rescueUsed: boolean;
  rescueOptions: RescueOption[];
  won: boolean | null;
  stars: number;
  accessibility: AccessibilitySettings;
  showScienceLibrary: boolean;
  showComicBook: boolean;
  showSettings: boolean;
  scienceUnlocked: string[];
  spaceWeather: SpaceWeatherState | null;
  samiMood: SamiMood;
}
