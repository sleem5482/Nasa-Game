import type { GameEvent, Planet } from "./types";

export const GAME_EVENTS: GameEvent[] = [
  {
    id: "solar-flare",
    title: "Solar Flare Warning!",
    crew: "chen",
    planet: "both",
    story:
      "Dr. Chen points at the sky monitors. \"The Sun just sneezed a big flare our way. Radiation is climbing. How should we protect the crew?\"",
    nasaTag: "DONKI solar weather",
    choices: [
      {
        id: "shelter-now",
        label: "Everyone to the Shelter",
        description: "Safe and cozy, but science work pauses.",
        effects: { shielding: 12, science: -4, energy: -2 },
        novaHint: "What matters most right now—safety or experiments?",
      },
      {
        id: "boost-shields",
        label: "Boost Radiation Shields",
        description: "Spend power to reinforce the walls.",
        effects: { shielding: 8, energy: -6, food: -1 },
        novaHint: "Extra shields cost energy. Is the power budget ready?",
      },
      {
        id: "keep-working",
        label: "Keep Working Carefully",
        description: "Riskier, but you keep making science points.",
        effects: { shielding: -10, science: 6, oxygen: -2 },
        novaHint: "Brave choice! What happens if shielding gets too low?",
      },
    ],
  },
  {
    id: "dust-storm",
    title: "Martian Dust Storm",
    crew: "amara",
    planet: "mars",
    story:
      "Engineer Amara wipes orange dust off her visor. \"Solar panels are getting coated. Power will drop unless we act.\"",
    nasaTag: "Mars dust opacity",
    choices: [
      {
        id: "clean-panels",
        label: "Send a Cleaning Crew",
        description: "Restore energy, but use oxygen and food for the walk.",
        effects: { energy: 10, oxygen: -5, food: -3 },
        novaHint: "Is restoring power worth the life-support cost today?",
      },
      {
        id: "ration-power",
        label: "Ration Power Indoors",
        description: "Stay safe inside. Energy stays low.",
        effects: { energy: -4, oxygen: 2, science: -2 },
        novaHint: "Saving energy means something else may wait. Which?",
      },
      {
        id: "battery-reserve",
        label: "Tap Battery Reserves",
        description: "Borrow tomorrow’s power for today.",
        effects: { energy: 6, water: -3, shielding: -2 },
        novaHint: "Batteries help now—what might you owe tomorrow?",
      },
    ],
  },
  {
    id: "lunar-night",
    title: "Long Lunar Shadow",
    crew: "amara",
    planet: "moon",
    story:
      "Amara checks the heaters. \"We’re entering a long Moon night—almost two Earth weeks of darkness and cold.\"",
    nasaTag: "Lunar night thermal",
    choices: [
      {
        id: "heat-habitat",
        label: "Prioritize Habitat Heat",
        description: "Crew stays warm. Lab and greenhouse cool down.",
        effects: { oxygen: 3, food: -4, science: -3, energy: -3 },
        novaHint: "Warm crew or growing food—what’s the bigger risk?",
      },
      {
        id: "battery-heat",
        label: "Run Heaters on Batteries",
        description: "Spend stored energy to keep systems online.",
        effects: { energy: -8, food: 2, oxygen: 2, shielding: 1 },
        novaHint: "Batteries are finite. How empty is too empty?",
      },
      {
        id: "hibernate-lab",
        label: "Hibernate the Lab",
        description: "Pause science to save power for life support.",
        effects: { science: -5, energy: 4, water: 2, oxygen: 2 },
        novaHint: "Science can wait… unless a breakthrough is close!",
      },
    ],
  },
  {
    id: "filter-glitch",
    title: "Oxygen Filter Glitch",
    crew: "ortiz",
    planet: "both",
    story:
      "Medic Ortiz holds up a blinking filter. \"Life support is coughing. We need a fix before bedtime.\"",
    nasaTag: "Life support redundancy",
    choices: [
      {
        id: "repair-now",
        label: "Full Repair Tonight",
        description: "Uses energy and spare parts budget (food/water).",
        effects: { oxygen: 10, energy: -5, water: -2, food: -1 },
        novaHint: "A full fix costs resources. Is oxygen already low?",
      },
      {
        id: "temp-patch",
        label: "Temporary Patch",
        description: "Quick help now, smaller gain.",
        effects: { oxygen: 4, energy: -2, science: -1 },
        novaHint: "Patches buy time. What will you fix tomorrow?",
      },
      {
        id: "reroute-power",
        label: "Reroute Lab Power",
        description: "Borrow from Research Lab fans.",
        effects: { oxygen: 6, science: -6, energy: -1 },
        novaHint: "Lab power helps air—how important is science today?",
      },
    ],
  },
  {
    id: "comms-delay",
    title: "Delayed Earth Call",
    crew: "chen",
    planet: "mars",
    story:
      "Dr. Chen smiles patiently. \"Earth’s reply will take minutes. We must decide without waiting for Mission Control.\"",
    nasaTag: "Mars light-time delay",
    choices: [
      {
        id: "local-call",
        label: "Trust Local Sensors",
        description: "Act now using base data.",
        effects: { science: 4, energy: -2, shielding: 1 },
        novaHint: "Local data is fast. Are your sensors healthy?",
      },
      {
        id: "wait-earth",
        label: "Wait for Earth Advice",
        description: "Safer guidance, but time and water tick away.",
        effects: { science: 2, water: -3, food: -2, oxygen: -1 },
        novaHint: "Waiting is careful—but resources still drain.",
      },
      {
        id: "split-team",
        label: "Split the Team",
        description: "Some act, some wait. Balanced but tiring.",
        effects: { science: 3, energy: -3, food: -2, oxygen: 1 },
        novaHint: "Teamwork helps—does anyone look too tired?",
      },
    ],
  },
  {
    id: "dust-seal",
    title: "Lunar Dust on Seals",
    crew: "ortiz",
    planet: "moon",
    story:
      "Ortiz coughs softly. \"Moon dust sneaked near the hatch seals. It’s scratchy stuff—like glitter that never quits.\"",
    nasaTag: "Lunar regolith abrasion",
    choices: [
      {
        id: "deep-clean",
        label: "Deep Clean the Hatch",
        description: "Uses water and energy; oxygen stays safer.",
        effects: { water: -5, energy: -3, oxygen: 5, shielding: 2 },
        novaHint: "Water is precious. Is dust already hurting air?",
      },
      {
        id: "limit-eva",
        label: "Limit Outside Trips",
        description: "Less dust, less science from outside samples.",
        effects: { science: -4, oxygen: 3, food: 1, energy: 2 },
        novaHint: "Fewer walks means fewer samples. Fair trade?",
      },
      {
        id: "seal-upgrade",
        label: "Upgrade Seals Now",
        description: "Spend food/parts and energy for lasting protection.",
        effects: { food: -4, energy: -4, shielding: 6, oxygen: 2 },
        novaHint: "Upgrades cost today to protect many tomorrows.",
      },
    ],
  },
  {
    id: "greenhouse-wilt",
    title: "Greenhouse Wilt Alert",
    crew: "amara",
    planet: "both",
    story:
      "Amara holds a droopy leaf. \"Plants look thirsty. If we lose the greenhouse, food will get tight.\"",
    nasaTag: "OSDR plant growth",
    choices: [
      {
        id: "extra-water",
        label: "Give Extra Water & Light",
        description: "Food recovers; water and energy drop.",
        effects: { food: 8, water: -6, energy: -3 },
        novaHint: "Plants drink a lot. Can water spare that much?",
      },
      {
        id: "half-crop",
        label: "Save Half the Crop",
        description: "Balanced save—smaller food gain.",
        effects: { food: 4, water: -3, energy: -1, science: 1 },
        novaHint: "Half a garden is still a garden. Good enough?",
      },
      {
        id: "seed-bank",
        label: "Protect Seed Bank Only",
        description: "Lose some food now; keep future harvests.",
        effects: { food: -4, water: -1, science: 3, shielding: 1 },
        novaHint: "Future meals vs. tonight’s dinner—tough call!",
      },
    ],
  },
  {
    id: "science-breakthrough",
    title: "Lab Breakthrough?",
    crew: "chen",
    planet: "both",
    story:
      "Dr. Chen’s eyes light up. \"We’re close to a discovery! Pushing the lab tonight could earn big science—or burn resources.\"",
    nasaTag: "OSDR discovery mindset",
    choices: [
      {
        id: "all-in-lab",
        label: "All Power to the Lab",
        description: "Big science spike; life support dips.",
        effects: { science: 12, oxygen: -5, energy: -4, water: -2 },
        novaHint: "Big rewards need big risks. Check oxygen first!",
      },
      {
        id: "steady-science",
        label: "Steady Overnight Run",
        description: "Modest science, safer balance.",
        effects: { science: 6, energy: -2, oxygen: -1 },
        novaHint: "Slow and steady still teaches the universe.",
      },
      {
        id: "pause-publish",
        label: "Pause and Double-Check",
        description: "No big gain, but crew rests and systems recover.",
        effects: { science: 1, oxygen: 3, food: 2, energy: 1 },
        novaHint: "Rest can be a smart engineering choice too.",
      },
    ],
  },
];

export function pickDailyEvent(planet: Planet, day: number): GameEvent {
  const pool = GAME_EVENTS.filter(
    (event) => event.planet === "both" || event.planet === planet,
  );
  // Deterministic-ish rotation so replays feel fair but varied
  const index = (day - 1 + (planet === "mars" ? 1 : 0)) % pool.length;
  return structuredClone(pool[index]);
}

export function crewDisplayName(crew: GameEvent["crew"]): string {
  switch (crew) {
    case "amara":
      return "Engineer Amara";
    case "chen":
      return "Dr. Chen";
    case "ortiz":
      return "Medic Ortiz";
    case "sami":
      return "Sami";
    case "nova":
      return "NOVA";
  }
}
