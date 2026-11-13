import type { ModuleAction, ModuleId } from "./types";

export const CREW_ACTIONS_PER_DAY = 3;

export const MODULE_ACTIONS: Record<ModuleId, ModuleAction[]> = {
  habitat: [
    {
      id: "monitor-air",
      moduleId: "habitat",
      title: "Monitor air quality",
      description: "Tune the life-support mix and check the crew air filters.",
      effects: { energy: -1, oxygen: 3 },
      coachNote: "A small systems check can keep the whole crew breathing easier.",
    },
    {
      id: "repair-recycler",
      moduleId: "habitat",
      title: "Repair water recycler",
      description: "Spend energy to recover more clean water.",
      effects: { energy: -4, water: 6 },
      coachNote: "Recycling saves water, but keeping the system running takes power.",
    },
    {
      id: "thermal-insulation",
      moduleId: "habitat",
      title: "Add thermal insulation",
      description: "Improve the habitat seal against extreme temperatures.",
      effects: { energy: -5, shielding: 4 },
      coachNote: "Extra insulation protects the crew, at an energy cost.",
    },
  ],
  // Food in the greenhouse now comes from the planting beds (plant, water, harvest).
  greenhouse: [
    {
      id: "hydroponics",
      moduleId: "greenhouse",
      title: "Research hydroponics",
      description: "Test a water-efficient growing technique.",
      effects: { water: -3, science: 4 },
      coachNote: "Research can unlock ideas, though experiments still need supplies.",
    },
  ],
  power: [
    {
      id: "clean-panels",
      moduleId: "power",
      title: "Clean solar panels",
      description: "Clear dust and improve the station's energy supply.",
      effects: { energy: 6 },
      coachNote: "A clean array can collect more power for the next operation.",
    },
    {
      id: "upgrade-battery",
      moduleId: "power",
      title: "Upgrade battery",
      description: "Use water to cool and service the storage cells.",
      effects: { water: -3, energy: 5 },
      coachNote: "Battery maintenance improves energy reserves, using some water.",
    },
    {
      id: "emergency-reserve",
      moduleId: "power",
      title: "Use emergency reserve",
      description: "Release a protected charge for the outpost.",
      effects: { shielding: -2, energy: 8 },
      coachNote: "The reserve gives power now, but leaves less protection in reserve.",
    },
  ],
  shelter: [
    {
      id: "regolith-shielding",
      moduleId: "shelter",
      title: "Add regolith shielding",
      description: "Reinforce the shelter using stored energy.",
      effects: { energy: -6, shielding: 8 },
      coachNote: "More shielding helps in a radiation event, but costs energy.",
    },
    {
      id: "shelter-drill",
      moduleId: "shelter",
      title: "Run shelter drill",
      description: "Practice a quick crew response to a solar storm.",
      effects: { energy: -1, shielding: 3 },
      coachNote: "A short drill improves readiness with a small energy cost.",
    },
    {
      id: "space-weather",
      moduleId: "shelter",
      title: "Monitor space weather",
      description: "Check for solar activity and prepare the shelter.",
      effects: { energy: -2, shielding: 4 },
      coachNote: "Better forecasts help the crew prepare before a storm arrives.",
    },
  ],
  lab: [
    {
      id: "analyze-samples",
      moduleId: "lab",
      title: "Analyze samples",
      description: "Use lab equipment to turn a sample into mission science.",
      effects: { energy: -4, science: 5 },
      coachNote: "Analysis earns science points but needs powered instruments.",
    },
    {
      id: "study-plant-growth",
      moduleId: "lab",
      title: "Study plant growth",
      description: "Share research with the greenhouse to improve food production.",
      effects: { energy: -3, food: 2, science: 3 },
      coachNote: "Plant research can help both science and the crew's food supply.",
    },
    {
      id: "test-dust-filters",
      moduleId: "lab",
      title: "Test dust filters",
      description: "Run a filter test to support safer outpost systems.",
      effects: { energy: -2, shielding: 2, science: 2 },
      coachNote: "Filter tests build knowledge while taking a little energy.",
    },
  ],
};
