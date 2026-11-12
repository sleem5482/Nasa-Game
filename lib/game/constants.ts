import type {
  CropPlot,
  Difficulty,
  ModuleState,
  PowerAllocation,
  Resources,
  ResourceKey,
} from "./types";

export const MISSION_LENGTH = 30;
export const POWER_BUDGET = 10;

/** Starting supply multipliers by simulation difficulty */
export const DIFFICULTY_START: Record<Difficulty, number> = {
  easy: 1.15,
  normal: 1,
  expert: 0.82,
};

export const RESOURCE_META: Record<
  ResourceKey,
  { label: string; color: string; icon: string }
> = {
  energy: { label: "Energy", color: "#F5C542", icon: "Zap" },
  water: { label: "Water", color: "#5BB8FF", icon: "Droplets" },
  oxygen: { label: "Oxygen", color: "#36D6F5", icon: "Wind" },
  food: { label: "Food", color: "#7DDE6A", icon: "Apple" },
  shielding: { label: "Shielding", color: "#A78BFA", icon: "Shield" },
  science: { label: "Science", color: "#FFD166", icon: "Star" },
};

export const INITIAL_RESOURCES: Resources = {
  energy: 72,
  water: 70,
  oxygen: 75,
  food: 68,
  shielding: 65,
  science: 10,
};

export const EMPTY_ALLOCATION: PowerAllocation = {
  habitat: 2,
  greenhouse: 2,
  power: 2,
  shelter: 2,
  lab: 2,
};

export const INITIAL_MODULES: ModuleState[] = [
  {
    id: "habitat",
    name: "Habitat",
    level: 1,
    maxLevel: 3,
    status: "online",
    description: "Home base for sleeping, cooking, and breathing easy.",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    level: 1,
    maxLevel: 3,
    status: "online",
    description: "Grows food and helps recycle air and water.",
  },
  {
    id: "power",
    name: "Power Station",
    level: 1,
    maxLevel: 3,
    status: "online",
    description: "Solar arrays and batteries that feed the whole outpost.",
  },
  {
    id: "shelter",
    name: "Radiation Shelter",
    level: 1,
    maxLevel: 3,
    status: "online",
    description: "Thick walls that block space radiation during storms.",
  },
  {
    id: "lab",
    name: "Research Lab",
    level: 1,
    maxLevel: 3,
    status: "online",
    description: "Where experiments earn Science Stars for future explorers.",
  },
];

export const NOVA_TIPS = [
  "Every choice spends something. Ask: what am I trading?",
  "If oxygen dips below 40, Sami starts sweating—time to help life support!",
  "Science is exciting, but empty tummies make tough nights.",
  "On Mars, dust loves solar panels. Keep energy in mind.",
  "On the Moon, nights last a long time. Save battery warmth!",
  "NOVA never gives the answer—only better questions. You’ve got this!",
  "Check your weakest meter before you end the day.",
  "A star rating loves balanced resources more than one huge spike.",
];

export const UPGRADE_COST = 8; // science points

// ---- Greenhouse beds ----
export const PLOT_COUNT = 4;
export const PLANT_WATER_COST = 2; // planting includes the first watering
export const WATER_PER_BED = 1; // watering one bed for a day
export const HARVEST_FOOD = 10;

export const INITIAL_PLOTS: CropPlot[] = Array.from({ length: PLOT_COUNT }, () => ({
  stage: "empty" as const,
  watered: false,
  thirst: 0,
}));
