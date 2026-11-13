import type { DecisionChoice, GameEvent, Planet } from "./types";

/**
 * Hand-written mission events. Each one is a small trade-off story: two or
 * three choices, each with a clear upside and a clear cost.
 */
export const GAME_EVENTS: GameEvent[] = [
  {
    id: "dust-storm",
    title: "A Dust Storm Is Coming!",
    kind: "warning",
    crew: "amara",
    planet: "mars",
    imageKey: "dust-storm",
    nasaTag: "Mars dust opacity",
    story:
      "Captain! A big dust storm is approaching Nova Base. Our solar panels may stop collecting enough sunlight!",
    impacts: [
      "Solar panels make less power.",
      "Our batteries may run low.",
      "Some machines may have to stop.",
    ],
    choices: [
      {
        id: "clean-panels",
        label: "Clean the Solar Panels",
        description: "Send the crew outside to wipe the panels before the storm arrives.",
        upside: "The panels catch more light before the dust hides the Sun.",
        downside: "The crew works outside in dusty air and gets tired.",
        effects: { power: 9, lifeSupport: -5, protection: -2 },
        lesson:
          "Cleaning the panels early protects our power, but working outside costs the crew energy.",
        takeaway: "Fix a problem before it grows — but count what the fix costs.",
        tags: ["panels-clean", "crew-tired"],
      },
      {
        id: "backup-batteries",
        label: "Use the Backup Batteries",
        description: "Save the crew's time and let the batteries carry the base.",
        upside: "Power stays steady during the storm.",
        downside: "The batteries will be emptier tomorrow.",
        effects: { power: 12, protection: -4, lifeSupport: -2 },
        lesson:
          "Stored power is a cushion for a hard day. Using it now means less is left later.",
        takeaway: "A backup is only helpful if you remember it is limited.",
        tags: ["battery-drain"],
      },
      {
        id: "turn-off-machines",
        label: "Turn Off Some Machines",
        description: "Save electricity by stopping machines that are not essential today.",
        upside: "We spend much less power during the storm.",
        downside: "The machines we stop will not help us today.",
        effects: { power: 4, lifeSupport: -2, protection: -2 },
        requiresPowerPlan: true,
        lesson:
          "Not every machine needs to run all the time. Saving power keeps the important systems alive.",
        takeaway: "Choose what must run, not what could run.",
        tags: ["power-save"],
      },
    ],
  },
  {
    id: "lunar-night",
    title: "The Long Lunar Night",
    kind: "warning",
    crew: "amara",
    planet: "moon",
    imageKey: "lunar-night",
    nasaTag: "Lunar night thermal control",
    story:
      "Captain, we are entering a long lunar night. The Sun will be gone for days, and the base will get very cold.",
    impacts: [
      "Solar panels stop charging the batteries.",
      "Heaters must work overtime.",
      "Batteries become our only power.",
    ],
    choices: [
      {
        id: "keep-heaters",
        label: "Keep the Heaters On",
        description: "Spend power to keep every room warm and comfortable.",
        upside: "The crew stays warm and healthy all night.",
        downside: "The heaters drink a lot of power.",
        effects: { lifeSupport: 7, power: -10 },
        lesson: "Warmth is part of life support on the Moon. Comfort has a power price.",
        takeaway: "Life support comes first — then see what power is left.",
        tags: ["heat-kept"],
      },
      {
        id: "turn-down-heaters",
        label: "Turn Down the Heaters",
        description: "Warm only the rooms the crew is using tonight.",
        upside: "We keep much more power in the batteries.",
        downside: "The cold makes the crew tired and uncomfortable.",
        effects: { lifeSupport: -6, power: 7 },
        requiresPowerPlan: true,
        lesson:
          "Turning down what is not needed saves power. The crew pays a little comfort for it.",
        takeaway: "Small savings add up when a night is long.",
        tags: ["heat-saved"],
      },
      {
        id: "sleep-in-shelter",
        label: "Move the Crew to the Shelter",
        description: "The thick shelter walls hold heat better than the habitat.",
        upside: "The crew stays warm and safer from radiation.",
        downside: "Power is needed to move equipment, and the lab pauses.",
        effects: { protection: 8, lifeSupport: -3, power: -4 },
        lesson:
          "The shelter protects the crew from two dangers at once: cold and radiation.",
        takeaway: "Sometimes one smart move protects more than one thing.",
        tags: ["shelter-used"],
      },
    ],
  },
  {
    id: "solar-flare",
    title: "Solar Storm Warning!",
    kind: "warning",
    crew: "chen",
    planet: "both",
    imageKey: "solar-flare",
    nasaTag: "DONKI space weather",
    severity: "strong",
    story:
      "Captain, the Sun just released a big flare. Radiation around the base is climbing.",
    impacts: [
      "Radiation reaches the base.",
      "Protection may drop quickly.",
      "The Earth link may go quiet for a while.",
    ],
    choices: [
      {
        id: "shelter-now",
        label: "Everyone to the Shelter",
        description: "Pause work and move the whole crew into the radiation shelter.",
        upside: "The crew is safe and protection stays strong.",
        downside: "Work stops and moving the crew uses power.",
        effects: { protection: 10, power: -4, lifeSupport: 2 },
        lesson:
          "When radiation rises, people are safer inside thick walls. Pausing work is a fair price.",
        takeaway: "Safety first — the experiments can wait.",
        tags: ["sheltered"],
      },
      {
        id: "boost-shields",
        label: "Boost the Radiation Shields",
        description: "Send power to the shield coils and keep working.",
        upside: "Protection improves and the crew can keep working.",
        downside: "The shield coils use a lot of power.",
        effects: { protection: 7, power: -8 },
        lesson: "Shields can be strengthened with power, but power is not free.",
        takeaway: "Protection can be bought with power — plan for the bill.",
        tags: ["boosted-shields"],
      },
      {
        id: "keep-working",
        label: "Keep Working Carefully",
        description: "Stay at the workstations and finish today's tasks.",
        upside: "No power is spent on the shelter.",
        downside: "Protection drops while the crew stays exposed.",
        effects: { protection: -12, power: 2, lifeSupport: -3 },
        lesson:
          "Ignoring a warning saves time now, but it makes the next emergency more dangerous.",
        takeaway: "A warning is a gift. It arrives before the problem.",
        tags: ["ignored-warning"],
      },
    ],
  },
  {
    id: "filter-glitch",
    title: "Oxygen Filter Glitch",
    kind: "warning",
    crew: "ortiz",
    planet: "both",
    imageKey: "filter-glitch",
    nasaTag: "Life support redundancy",
    story:
      "Captain, the air filter is blinking. Life support is coughing, and we need a fix before bedtime.",
    impacts: [
      "Life Support may fall.",
      "The crew could feel tired and short of breath.",
      "A small glitch can grow into a big one.",
    ],
    choices: [
      {
        id: "full-repair",
        label: "Full Repair Tonight",
        description: "Replace the filter properly and test the whole system.",
        upside: "Life Support recovers strongly.",
        downside: "The repair uses a lot of power and some spare parts.",
        effects: { lifeSupport: 12, power: -6, protection: -1 },
        lesson:
          "A full repair costs more today, but it stops the same problem from returning tomorrow.",
        takeaway: "Fix it properly when the crew depends on it.",
        tags: ["full-repair"],
      },
      {
        id: "temp-patch",
        label: "Temporary Patch",
        description: "Patch the filter quickly and check it again tomorrow.",
        upside: "Life Support gets a small boost for very little power.",
        downside: "The patch may not last.",
        effects: { lifeSupport: 5, power: -2 },
        lesson: "A quick patch buys time. It is a plan, not a solution.",
        takeaway: "Buying time is smart — if you plan the real fix.",
        tags: ["quick-patch"],
      },
      {
        id: "reroute-lab-power",
        label: "Reroute the Lab's Power",
        description: "Borrow power from the Research Lab to clean the air.",
        upside: "Life Support improves without draining the batteries much.",
        downside: "Protection research slows down.",
        effects: { lifeSupport: 7, power: -3, protection: -4 },
        lesson:
          "Moving power from one system to another helps one meter and slows another.",
        takeaway: "Power can only be in one place at a time.",
        tags: ["lab-borrowed"],
      },
    ],
  },
  {
    id: "greenhouse-wilt",
    title: "The Greenhouse Needs Attention",
    kind: "warning",
    crew: "amara",
    planet: "both",
    imageKey: "greenhouse-wilt",
    nasaTag: "OSDR plant growth",
    story:
      "Captain, the storm has passed, but our plants look droopy. The greenhouse needs attention!",
    impacts: [
      "Food and fresh air may run low.",
      "The crew may need to spend power on grow lights.",
      "A small garden problem becomes a big one if ignored.",
    ],
    choices: [
      {
        id: "extra-light-water",
        label: "Give Extra Light and Water",
        description: "Run the grow lights longer and water every bed.",
        upside: "The plants recover and Life Support gets a big boost.",
        downside: "Grow lights use a lot of power.",
        effects: { lifeSupport: 11, power: -7 },
        lesson:
          "A healthy greenhouse supports life support, but the lights cost real power.",
        takeaway: "Growing food is a power trade, not free food.",
        tags: ["garden-saved"],
      },
      {
        id: "half-crop",
        label: "Save Half the Crop",
        description: "Focus water and light on the healthiest beds.",
        upside: "Some plants survive with a small power cost.",
        downside: "The harvest is smaller.",
        effects: { lifeSupport: 5, power: -2 },
        lesson: "You do not always have to save everything. Save what matters most.",
        takeaway: "Half a garden is still a garden.",
        tags: ["half-crop"],
      },
      {
        id: "seed-bank",
        label: "Protect the Seed Bank Only",
        description: "Let the weak plants go and keep the seeds for a better day.",
        upside: "Future harvests stay possible, and power is saved.",
        downside: "Life Support drops today.",
        effects: { lifeSupport: -4, power: 3, protection: 1 },
        lesson:
          "Protecting the future sometimes means accepting a loss today.",
        takeaway: "Seeds are a promise for tomorrow.",
        tags: ["seed-bank"],
      },
    ],
  },
  {
    id: "water-recycler",
    title: "The Water Recycler Is Stuck",
    kind: "warning",
    crew: "ortiz",
    planet: "both",
    imageKey: "water-recycler",
    nasaTag: "ISS water recovery",
    story:
      "Captain, the water recycler is making a clunking sound. Every drop we clean is a drop the crew can drink.",
    impacts: [
      "Life Support may fall.",
      "Cleaning water takes power.",
      "A broken recycler wastes water fast.",
    ],
    choices: [
      {
        id: "repair-recycler",
        label: "Repair the Recycler",
        description: "Take it apart now and replace the worn pump.",
        upside: "Life Support recovers strongly.",
        downside: "The repair uses power and takes the crew's afternoon.",
        effects: { lifeSupport: 10, power: -6 },
        lesson: "Clean water is life support. Repairing it is worth real power.",
        takeaway: "On a base, every drop is recycled more than once.",
        tags: ["recycler-fixed"],
      },
      {
        id: "collect-ice",
        label: "Collect Ice Outside",
        description: "Send a small team to gather ice from the surface.",
        upside: "Fresh water raises Life Support.",
        downside: "Outside work costs protection and power.",
        effects: { lifeSupport: 7, power: -2, protection: -3 },
        lesson:
          "Water can be found outside, but the trip is a small risk to the crew.",
        takeaway: "Nature can supply us — with effort and risk.",
        tags: ["ice-collected"],
      },
      {
        id: "ration-water",
        label: "Ration Water",
        description: "Cut water use and wait for a better time to repair.",
        upside: "Power is saved and protection work gets a boost.",
        downside: "The crew has less water, so Life Support drops.",
        effects: { lifeSupport: -6, power: 3, protection: 2 },
        lesson:
          "Rationing stretches a supply, but it does not create new water.",
        takeaway: "Saving a resource is not the same as replacing it.",
        tags: ["ration-water"],
      },
    ],
  },
  {
    id: "ice-discovery",
    title: "We Found Ice!",
    kind: "opportunity",
    crew: "chen",
    planet: "both",
    imageKey: "ice-discovery",
    nasaTag: "Lunar and Martian water ice",
    story:
      "Captain! Our sensors found a patch of water ice near the base. It could help the crew — if we spend the power to reach it.",
    impacts: [
      "A new water source can raise Life Support.",
      "Drilling costs power and time.",
      "A careful study costs less but gives less.",
    ],
    choices: [
      {
        id: "drill-ice",
        label: "Send a Team to Drill",
        description: "Take the drill outside and bring ice back to the base.",
        upside: "A big boost to Life Support.",
        downside: "Drilling uses power and exposes the crew outside.",
        effects: { lifeSupport: 12, power: -5, protection: -2 },
        lesson: "Exploring pays off, but every trip outside has a cost.",
        takeaway: "A discovery becomes useful only when we decide to act on it.",
        tags: ["ice-drilled"],
      },
      {
        id: "study-from-base",
        label: "Study It From the Base",
        description: "Use sensors and a small rover instead of a crew trip.",
        upside: "Protection research gains new data.",
        downside: "The crew gets less water today.",
        effects: { lifeSupport: 4, protection: 4, power: -2 },
        lesson: "A safer, slower study can still make the base stronger.",
        takeaway: "Choosing a safer way is still choosing to explore.",
        tags: ["ice-studied"],
      },
      {
        id: "leave-ice",
        label: "Leave It for Another Day",
        description: "Mark the spot and save today's power.",
        upside: "Power stays high and the discovery is recorded.",
        downside: "The crew gets no water today.",
        effects: { power: 5, protection: 1 },
        lesson:
          "Not every opportunity must be taken today. Saving resources is a real decision.",
        takeaway: "Saying not yet is different from saying no.",
        tags: ["ice-delayed"],
      },
    ],
  },
  {
    id: "dust-seal",
    title: "Moon Dust on the Hatch",
    kind: "warning",
    crew: "ortiz",
    planet: "moon",
    imageKey: "dust-seal",
    nasaTag: "Lunar regolith abrasion",
    story:
      "Captain, Moon dust has crept near the hatch seals. It is scratchy stuff — like glitter that never quits.",
    impacts: [
      "Seals may wear out and let air escape.",
      "Cleaning takes power and water.",
      "Dust can damage equipment quietly.",
    ],
    choices: [
      {
        id: "deep-clean",
        label: "Deep Clean the Hatch",
        description: "Wash the seals and check the airlock carefully.",
        upside: "Life Support and Protection both improve.",
        downside: "Water and power are spent on the cleaning.",
        effects: { lifeSupport: 7, protection: 3, power: -4 },
        lesson:
          "Cleaning Moon dust is maintenance, and maintenance keeps air inside the base.",
        takeaway: "Small upkeep prevents big leaks.",
        tags: ["hatch-clean"],
      },
      {
        id: "limit-eva",
        label: "Limit Outside Trips",
        description: "Keep the crew inside until the dust settles.",
        upside: "Power is saved and less dust gets in.",
        downside: "Protection checks are delayed.",
        effects: { lifeSupport: 3, power: 3, protection: -2 },
        lesson: "Staying inside reduces dust, but some checks still need doing.",
        takeaway: "Avoiding a risk is smart; ignoring a chore is not.",
        tags: ["stayed-inside"],
      },
      {
        id: "upgrade-seals",
        label: "Upgrade the Seals",
        description: "Install a better seal that will resist dust for many days.",
        upside: "Protection improves a lot.",
        downside: "The upgrade costs power today.",
        effects: { protection: 9, power: -5 },
        lesson:
          "An upgrade costs today but can protect the base for the rest of the mission.",
        takeaway: "Some spending is an investment, not a loss.",
        tags: ["seals-upgraded"],
      },
    ],
  },
  {
    id: "comms-delay",
    title: "Earth's Reply Is Late",
    kind: "info",
    crew: "chen",
    planet: "mars",
    imageKey: "comms-delay",
    nasaTag: "Mars light-time delay",
    story:
      "Captain, we asked Earth for advice, but the reply will take minutes to arrive. We must decide without waiting.",
    impacts: [
      "Helpful advice may arrive after we need it.",
      "Our own sensors still work.",
      "Waiting costs time and life support.",
    ],
    choices: [
      {
        id: "trust-sensors",
        label: "Trust Our Own Sensors",
        description: "Act now using the base's measurements.",
        upside: "Fast action and a small protection gain.",
        downside: "Local sensors miss some of the big picture.",
        effects: { protection: 4, power: -2 },
        lesson:
          "A crew far from Earth must sometimes trust its own instruments.",
        takeaway: "Good data today beats perfect data too late.",
        tags: ["trusted-sensors"],
      },
      {
        id: "wait-earth",
        label: "Wait for Earth",
        description: "Hold the decision until the reply arrives.",
        upside: "Earth's advice is usually careful and tested.",
        downside: "The crew waits, and life support keeps running.",
        effects: { power: 3, lifeSupport: -4 },
        lesson: "Waiting for help can be wise, but time is a resource too.",
        takeaway: "Distance turns a conversation into a waiting game.",
        tags: ["waited-earth"],
      },
      {
        id: "split-team",
        label: "Split the Team",
        description: "Half the crew acts now; half waits for Earth.",
        upside: "The base keeps moving without losing all caution.",
        downside: "Everyone is a little more tired.",
        effects: { lifeSupport: 4, power: -3, protection: 1 },
        lesson: "A middle path can work, but it asks more of the crew.",
        takeaway: "Two plans can run at once if the crew has energy.",
        tags: ["split-team"],
      },
    ],
  },
  {
    id: "equipment-damage",
    title: "A Machine Broke Down",
    kind: "warning",
    crew: "amara",
    planet: "both",
    imageKey: "equipment-damage",
    nasaTag: "Mission hardware maintenance",
    story:
      "Captain, one of the base machines broke during the night. We can fix it, patch it, or run without it.",
    impacts: [
      "A repair may cost power.",
      "Running without it keeps power but weakens the base.",
      "A small fault can spread.",
    ],
    choices: [
      {
        id: "fix-now",
        label: "Fix It Right Away",
        description: "Take the machine apart and repair it properly.",
        upside: "Protection and Life Support both improve.",
        downside: "The repair uses a lot of power.",
        effects: { protection: 6, lifeSupport: 3, power: -6 },
        lesson: "Repairing early keeps a small fault from becoming a crisis.",
        takeaway: "Maintenance is cheaper than an emergency.",
        tags: ["repaired"],
      },
      {
        id: "patch-it",
        label: "Patch It for Now",
        description: "Use a quick fix and watch the machine closely.",
        upside: "A small gain with a small power cost.",
        downside: "The patch is not a permanent repair.",
        effects: { protection: 2, power: -2 },
        lesson: "A patch is a bridge to the real repair, not a replacement.",
        takeaway: "Temporary fixes need a follow-up plan.",
        tags: ["patched"],
      },
      {
        id: "shut-it-down",
        label: "Shut It Down",
        description: "Stop the broken machine and save its power.",
        upside: "The batteries get a break.",
        downside: "Protection drops while the machine is off.",
        effects: { protection: -7, power: 6, lifeSupport: -2 },
        lesson:
          "Switching off a broken machine saves power but removes what it was protecting.",
        takeaway: "Turning something off is also a trade.",
        tags: ["shut-down"],
      },
    ],
  },
  {
    id: "quiet-day",
    title: "A Calm Day at the Base",
    kind: "info",
    crew: "sami",
    planet: "both",
    imageKey: "quiet-day",
    nasaTag: "Crew health and sleep",
    story:
      "Captain, no alarms today! The base is quiet. A calm day is a good time to repair, rest, or practise.",
    impacts: [
      "No emergency — you choose how to use the day.",
      "Maintenance can prepare for the days ahead.",
      "Rest helps the crew stay healthy.",
    ],
    choices: [
      {
        id: "maintenance",
        label: "Run a Maintenance Day",
        description: "Tighten, clean and test the base systems.",
        upside: "Power generation improves and the base is ready.",
        downside: "The crew spends the day working.",
        effects: { power: 7, protection: -2 },
        lesson: "Calm days are for preparing, not just relaxing.",
        takeaway: "Use quiet time to make the next storm easier.",
        tags: ["maintenance"],
      },
      {
        id: "rest-crew",
        label: "Let the Crew Rest",
        description: "A slow day with good food and extra sleep.",
        upside: "Life Support rises as the crew recovers.",
        downside: "Nothing gets repaired.",
        effects: { lifeSupport: 8, power: -3 },
        lesson: "Rest is part of the mission, not a break from it.",
        takeaway: "Healthy crews make better decisions.",
        tags: ["rested"],
      },
      {
        id: "shelter-drill",
        label: "Practise a Shelter Drill",
        description: "Run a practice evacuation and check the shields.",
        upside: "Protection improves a lot.",
        downside: "The drill uses power and tires the crew a little.",
        effects: { protection: 8, power: -4 },
        lesson: "Practising before an emergency makes the real one calmer.",
        takeaway: "A drill is a promise to your future self.",
        tags: ["drilled"],
      },
    ],
  },
  {
    id: "final-check",
    title: "One Day Left",
    kind: "info",
    crew: "nova",
    planet: "both",
    imageKey: "final-check",
    nasaTag: "Mission readiness",
    story:
      "Captain, tomorrow the mission ends. Let's leave Nova Base in the best shape we can — and bring the crew home safe.",
    impacts: [
      "This is the last chance to raise a low meter.",
      "Every choice still has a cost.",
      "The final report looks at all three meters.",
    ],
    choices: [
      {
        id: "safety-check",
        label: "Full Safety Check",
        description: "Walk through every module and seal every hatch.",
        upside: "Protection finishes strong.",
        downside: "The check uses power.",
        effects: { protection: 8, power: -4 },
        lesson: "A careful finish protects everything the crew built.",
        takeaway: "End the mission the way you started it: carefully.",
        tags: ["final-check"],
      },
      {
        id: "care-for-crew",
        label: "Care for the Crew",
        description: "A warm meal, clean water and a good night's sleep.",
        upside: "Life Support finishes strong.",
        downside: "The extra comfort uses power.",
        effects: { lifeSupport: 9, power: -3 },
        lesson: "The crew is the mission. Caring for them is always worth it.",
        takeaway: "People are the point of every machine.",
        tags: ["crew-care"],
      },
      {
        id: "save-power",
        label: "Save Power for the Night",
        description: "Switch off everything that is not essential.",
        upside: "Power finishes strong.",
        downside: "Protection work waits until after the mission.",
        effects: { power: 9, protection: -3 },
        lesson: "A strong finish is about balance, not one perfect meter.",
        takeaway: "Look at all three meters before you choose.",
        tags: ["power-saved"],
      },
    ],
  },
];

/** Events that make sense as a direct consequence of an earlier choice. */
export const FOLLOW_UPS: Record<string, string> = {
  "power-save": "greenhouse-wilt",
  "panels-clean": "equipment-damage",
  "crew-tired": "quiet-day",
  "battery-drain": "equipment-damage",
  "ration-water": "water-recycler",
  "seed-bank": "greenhouse-wilt",
  "lab-borrowed": "equipment-damage",
  "ignored-warning": "solar-flare",
  "heat-saved": "greenhouse-wilt",
  "repaired": "quiet-day",
};

export function eventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((event) => event.id === id);
}

export function crewDisplayName(crew: GameEvent["crew"]): string {
  switch (crew) {
    case "amara":
      return "Commander Amara";
    case "chen":
      return "Engineer Chen";
    case "ortiz":
      return "Botanist Ortiz";
    case "sami":
      return "Sami";
    case "nova":
      return "NOVA";
  }
}

export function eventPoolForPlanet(planet: Planet): GameEvent[] {
  return GAME_EVENTS.filter(
    (event) => event.planet === "both" || event.planet === planet,
  );
}

export function firstChoiceImage(event: GameEvent): string {
  return event.imageKey ?? event.id;
}
