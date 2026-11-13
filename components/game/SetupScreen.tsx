"use client";

import { useMemo, useState, type DragEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Flag,
  GripVertical,
  Info,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import {
  DIFFICULTY_START,
  RESOURCE_META,
  RESOURCE_ORDER,
} from "@/lib/game/constants";
import { applyDelta, totalDelta } from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import type { Resources } from "@/lib/game/types";
import { ComicBookButton } from "./ComicBookButton";
import { CrewPortrait, NovaBot } from "./Characters";
import { MeterBar } from "./MeterBar";

type BuildingId = "habitat" | "solar" | "oxygen" | "greenhouse";

interface Building {
  id: BuildingId;
  name: string;
  role: string;
  image: string;
  bonuses: Partial<Resources>;
}

/**
 * The four pieces of the first base. The Habitat must go down first, then the
 * other three add the power, air and food the crew needs to start Day 1.
 */
const BUILDINGS: Building[] = [
  {
    id: "habitat",
    name: "Habitat",
    role: "A safe home for the crew",
    image: "/images/building-storage.png",
    bonuses: { lifeSupport: 4 },
  },
  {
    id: "solar",
    name: "Solar Panels",
    role: "Turns sunlight into power",
    image: "/images/building-solar.png",
    bonuses: { power: 6 },
  },
  {
    id: "oxygen",
    name: "Oxygen System",
    role: "Keeps the air clean and breathable",
    image: "/images/building-oxygen.png",
    bonuses: { lifeSupport: 3 },
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    role: "Grows food and protects the crew",
    image: "/images/building-greenhouse.png",
    bonuses: { lifeSupport: 2, protection: 2 },
  },
];

const BUILDING_BY_ID = Object.fromEntries(
  BUILDINGS.map((building) => [building.id, building]),
) as Record<BuildingId, Building>;

const CREW: {
  crew: "amara" | "chen" | "ortiz" | "sami";
  name: string;
  role: string;
  line: string;
  skill: string;
  accent: string;
}[] = [
  {
    crew: "amara",
    name: "Amara",
    role: "Commander",
    line: "Makes the big decisions for the whole crew.",
    skill: "Leadership",
    accent: "border-amber-300/30 bg-amber-400/10 text-amber-200",
  },
  {
    crew: "chen",
    name: "Chen",
    role: "Engineer",
    line: "Repairs machines and builds new parts.",
    skill: "Engineering",
    accent: "border-sky-300/30 bg-sky-400/10 text-sky-200",
  },
  {
    crew: "ortiz",
    name: "Ortiz",
    role: "Botanist",
    line: "Grows food and keeps the greenhouse alive.",
    skill: "Plant Science",
    accent: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  },
  {
    crew: "sami",
    name: "Sami",
    role: "Scientist",
    line: "Explores the surface and discovers new things.",
    skill: "Research",
    accent: "border-violet-300/30 bg-violet-400/10 text-violet-200",
  },
];

const STEPS = [
  { label: "Welcome" },
  { label: "Crew" },
  { label: "Build" },
  { label: "Launch" },
];

const DIFFICULTY_LABEL = {
  easy: "Easy",
  normal: "Normal",
  expert: "Expert",
} as const;

function bonusText(bonuses: Partial<Resources>): string {
  return RESOURCE_ORDER.filter((key) => bonuses[key])
    .map((key) => `+${bonuses[key]} ${RESOURCE_META[key].label}`)
    .join(" · ");
}

function StepRail({
  step,
  onJump,
}: {
  step: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Base setup progress"
      className="rounded-[20px] border border-white/10 bg-[#081a2e]/85 px-3 py-2.5"
    >
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li
              key={item.label}
              className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2"
            >
              <button
                type="button"
                onClick={() => done && onJump(index)}
                disabled={!done}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${item.label}${done ? " (finished)" : ""}`}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-black transition ${
                  done
                    ? "border-cyan-300 bg-cyan-300 text-[#071426]"
                    : active
                      ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-200"
                      : "border-white/15 bg-white/5 text-white/35"
                }`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  index + 1
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[9px] font-black uppercase tracking-[0.12em] sm:text-[10px] ${
                    active
                      ? "text-cyan-200"
                      : done
                        ? "text-white/65"
                        : "text-white/30"
                  }`}
                >
                  {item.label}
                </p>
                <div
                  className={`mt-1 h-1 rounded-full ${
                    done || active ? "bg-cyan-300" : "bg-white/10"
                  }`}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function MissionSummary({
  preview,
  compact = false,
}: {
  preview: Resources;
  compact?: boolean;
}) {
  const planet = useGameStore((s) => s.planet);
  const difficulty = useGameStore((s) => s.difficulty);
  const baseName = useGameStore((s) => s.baseName);
  const missionLength = useGameStore((s) => s.missionLength);
  const planetLabel = planet === "mars" ? "Martian Outpost" : "Lunar Outpost";

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/12 bg-[#081a2e]/90">
      {!compact && (
        <div className="relative h-32">
          <Image
            src={planet === "mars" ? "/images/mars.png" : "/images/moon.png"}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081a2e] via-[#081a2e]/30 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur">
            {planetLabel}
          </span>
        </div>
      )}

      <div className="p-4">
        {compact && (
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">
            {planetLabel}
          </p>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
          Mission Day 1
        </p>
        <h2 className="mt-1 text-2xl font-black leading-tight">
          {baseName.trim() || "Nova Base"}
        </h2>
        <p className="text-xs font-semibold text-white/50">
          {missionLength} days · {DIFFICULTY_LABEL[difficulty]} difficulty
        </p>

        <div className="mt-3">
          <MeterBar values={preview} compact />
        </div>
        <p className="mt-2 text-[10px] font-semibold leading-relaxed text-white/45">
          Starting meters after the buildings you place.
        </p>
      </div>
    </section>
  );
}

function BuildingCard({
  building,
  canPlace,
  placed,
  selected,
  dragging,
  onChoose,
  onDragStart,
  onDragEnd,
}: {
  building: Building;
  canPlace: boolean;
  placed: boolean;
  selected: boolean;
  dragging: boolean;
  onChoose: () => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  const usable = canPlace && !placed;

  return (
    <button
      type="button"
      draggable={usable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onChoose}
      aria-pressed={selected}
      aria-disabled={!usable}
      className={`group flex w-full items-center gap-2.5 rounded-[16px] border-2 p-2 text-left transition ${
        placed
          ? "border-emerald-300/30 bg-emerald-400/8 opacity-70"
          : selected
            ? "border-cyan-300 bg-cyan-400/12 shadow-[0_0_18px_rgba(74,242,255,0.18)]"
            : usable
              ? "border-white/12 bg-[#0a1b2d] hover:border-cyan-300/60 hover:bg-cyan-400/5"
              : "border-white/8 bg-[#0a1b2d]/60 opacity-55"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <div className="relative h-11 w-14 shrink-0">
        <Image
          src={building.image}
          alt=""
          fill
          sizes="56px"
          className="object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-black text-white">{building.name}</p>
          {placed && (
            <Check
              className="h-3 w-3 shrink-0 text-emerald-300"
              strokeWidth={3}
              aria-hidden
            />
          )}
        </div>
        <p className="truncate text-[10px] font-semibold text-white/45">
          {building.role}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-black text-cyan-200/80">
          {bonusText(building.bonuses)}
        </p>
      </div>
      <GripVertical
        className={`h-4 w-4 shrink-0 ${usable ? "text-white/40" : "text-white/15"}`}
        aria-hidden
      />
    </button>
  );
}

function BuildSite({
  plots,
  interactive,
  selected,
  hoverPlot,
  onSelectPlot,
  onDropBuilding,
  onDragOverPlot,
  onDragLeavePlot,
}: {
  plots: (BuildingId | null)[];
  interactive: boolean;
  selected: BuildingId | null;
  hoverPlot: number | null;
  onSelectPlot?: (index: number) => void;
  onDropBuilding?: (event: DragEvent<HTMLDivElement>, index: number) => void;
  onDragOverPlot?: (event: DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeavePlot?: (index: number) => void;
}) {
  const planet = useGameStore((s) => s.planet);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-emerald-300/20 bg-[#0a1b2d] p-3 sm:p-4">
      <Image
        src={planet === "mars" ? "/images/mars.png" : "/images/moon.png"}
        alt=""
        fill
        sizes="(min-width: 1024px) 640px, 100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.22),transparent_58%)]" />

      <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3">
        {plots.map((buildingId, index) => {
          const building = buildingId ? BUILDING_BY_ID[buildingId] : null;
          const hovered = hoverPlot === index;
          const canDrop = interactive && !building && Boolean(selected);

          return (
            <div
              key={index}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={
                building
                  ? `${building.name} is built here`
                  : interactive
                    ? `Empty green area ${index + 1}. Drop or place a building here.`
                    : `Empty green area ${index + 1}`
              }
              onClick={() => interactive && onSelectPlot?.(index)}
              onKeyDown={(event) => {
                if (!interactive) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectPlot?.(index);
                }
              }}
              onDragOver={(event) => interactive && onDragOverPlot?.(event, index)}
              onDragLeave={() => interactive && onDragLeavePlot?.(index)}
              onDrop={(event) => interactive && onDropBuilding?.(event, index)}
              className={`relative flex min-h-[104px] flex-col items-center justify-center gap-1 rounded-[18px] border-2 p-2 text-center transition ${
                building
                  ? "border-emerald-300/50 bg-[#071426]/90 shadow-[0_10px_24px_rgba(2,10,20,0.55)]"
                  : canDrop
                    ? "border-cyan-300/70 bg-cyan-400/10"
                    : "border-dashed border-emerald-300/35 bg-[#071426]/45 hover:border-emerald-300/70"
              } ${hovered ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#06101f]" : ""} ${
                interactive ? "cursor-pointer" : ""
              }`}
            >
              {building ? (
                <>
                  <div className="relative h-14 w-full">
                    <Image
                      src={building.image}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] font-black leading-tight text-white">
                    {building.name}
                  </p>
                  <p className="text-[9px] font-bold text-emerald-300">
                    {bonusText(building.bonuses)}
                  </p>
                </>
              ) : (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 text-emerald-200">
                    <Crosshair className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="text-[10px] font-black text-emerald-100/80">
                    Green area
                  </p>
                  <p className="text-[9px] font-semibold text-white/45">
                    {interactive ? "Drop here" : "Open plot"}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SetupScreen() {
  const planet = useGameStore((s) => s.planet);
  const difficulty = useGameStore((s) => s.difficulty);
  const baseName = useGameStore((s) => s.baseName);
  const playerName = useGameStore((s) => s.playerName);
  const setScreen = useGameStore((s) => s.setScreen);
  const startMission = useGameStore((s) => s.startMission);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const [step, setStep] = useState(0);
  const [plots, setPlots] = useState<(BuildingId | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [selected, setSelected] = useState<BuildingId | null>(null);
  const [dragging, setDragging] = useState<BuildingId | null>(null);
  const [hoverPlot, setHoverPlot] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "Start with the Habitat — the crew needs a home first.",
  );

  const habitatPlaced = plots.includes("habitat");
  const placedCount = plots.filter(Boolean).length;
  const allPlaced = placedCount === BUILDINGS.length;

  const totalBonus = useMemo(
    () =>
      totalDelta(
        plots
          .filter((plot): plot is BuildingId => plot !== null)
          .map((id) => BUILDING_BY_ID[id].bonuses),
      ),
    [plots],
  );

  const preview = useMemo(
    () => applyDelta({ ...DIFFICULTY_START[difficulty] }, totalBonus),
    [difficulty, totalBonus],
  );

  const captain = playerName.trim() || "Nova";
  const planetLabel = planet === "mars" ? "Mars" : "Moon";

  const goTo = (next: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
    setSelected(null);
  };

  const back = () => {
    if (step === 0) {
      setScreen("briefing");
      return;
    }
    goTo(step - 1);
  };

  const placeBuilding = (id: BuildingId | null, index: number) => {
    if (!id) {
      setMessage("Pick a building card first, then tap a green plot.");
      return;
    }
    if (plots[index]) {
      setMessage("That plot is already taken. Choose an empty green plot.");
      return;
    }
    if (id !== "habitat" && !habitatPlaced) {
      setMessage(
        "Build the Habitat first — the crew needs a safe home before anything else.",
      );
      return;
    }
    if (plots.includes(id)) {
      setMessage(`${BUILDING_BY_ID[id].name} is already placed.`);
      return;
    }

    const next = plots.map((plot, plotIndex) =>
      plotIndex === index ? id : plot,
    );
    setPlots(next);
    setSelected(null);

    if (next.every(Boolean)) {
      setMessage(
        "All four buildings are placed! Your colony is ready for Day 1.",
      );
    } else if (id === "habitat") {
      setMessage(
        "Habitat placed! Now add Solar Panels, Oxygen and a Greenhouse.",
      );
    } else {
      setMessage(`${BUILDING_BY_ID[id].name} placed. Keep building!`);
    }
  };

  const chooseBuilding = (id: BuildingId) => {
    if (id !== "habitat" && !habitatPlaced) {
      setMessage("The Habitat must go first. Drag it to a green plot.");
      return;
    }
    if (plots.includes(id)) {
      setMessage(`${BUILDING_BY_ID[id].name} is already placed.`);
      return;
    }
    setSelected((current) => (current === id ? null : id));
    setMessage(
      `Selected ${BUILDING_BY_ID[id].name}. Tap a green plot to place it.`,
    );
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    const dropped = event.dataTransfer.getData("text/plain");
    const id = (dropped || dragging) as BuildingId | "";
    setDragging(null);
    setHoverPlot(null);
    if (!id) return;
    placeBuilding(id, index);
  };

  const resetBuild = () => {
    setPlots([null, null, null, null]);
    setSelected(null);
    setDragging(null);
    setHoverPlot(null);
    setMessage("Start with the Habitat — the crew needs a home first.");
  };

  const beginDay = () => {
    if (!allPlaced) {
      setMessage("Place all four buildings before you begin Day 1.");
      return;
    }
    startMission(totalBonus);
  };

  return (
    <div
      className="min-h-screen bg-[#0B121E] px-3 py-4 text-white sm:px-6 sm:py-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(11,18,30,.88), rgba(11,18,30,.95)), url(/images/bg-space.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={back}
            className="justify-self-start inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>

          <Image
            src="/images/logo.png"
            alt="Solbound"
            width={677}
            height={369}
            className="h-11 w-auto sm:h-14"
          />

          <div className="justify-self-end flex items-center gap-2">
            <ComicBookButton iconOnly />
            <p className="hidden text-right text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 sm:block sm:text-xs">
              Base Setup · 02
            </p>
          </div>
        </header>

        <StepRail step={step} onJump={goTo} />

        <motion.div
          key={step}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.28 }}
        >
          {step === 0 && (
            <section className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
              <div className="rounded-[28px] border border-cyan-300/20 bg-[#0B1B33]/90 p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-[radial-gradient(circle,_rgba(74,242,255,0.22),transparent_68%)]">
                    <NovaBot size="lg" speaking mood="happy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                      NOVA · Mission Companion
                    </p>
                    <h1 className="mt-1 text-2xl font-black leading-tight sm:text-4xl">
                      Welcome to {baseName.trim() || "Nova Base"}, Captain{" "}
                      {captain}!
                    </h1>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-white/80 sm:text-base">
                      Hello, astronaut! I&apos;m Nova, your mission companion.
                      I&apos;ll help you build your space base, protect your
                      crew, and survive on a new world!
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-200">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      Explore space and learn!
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold text-white/45">
                    <Users className="h-4 w-4 text-cyan-300" aria-hidden />4
                    crew members · {planetLabel} surface
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <ComicBookButton showLabel />
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#4AF2FF] px-6 py-3 text-sm font-black text-[#071426] shadow-[0_0_26px_rgba(74,242,255,0.3)] transition hover:bg-[#7df7ff]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>

              <MissionSummary preview={preview} />
            </section>
          )}

          {step === 1 && (
            <section className="rounded-[28px] border border-white/10 bg-[#0B1B33]/90 p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <NovaBot size="sm" speaking />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                    NOVA
                  </p>
                  <h1 className="text-2xl font-black leading-tight sm:text-3xl">
                    Meet the Crew
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-white/60">
                    Here&apos;s your crew! Each member has a special skill.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {CREW.map((member) => (
                  <article
                    key={member.crew}
                    className="rounded-[22px] border border-white/10 bg-[#071426]/80 p-4 transition hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <CrewPortrait crew={member.crew} />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                          {member.role}
                        </p>
                        <h2 className="text-lg font-black leading-tight text-white">
                          {member.name}
                        </h2>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-white/65">
                      {member.line}
                    </p>
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${member.accent}`}
                    >
                      Skill: {member.skill}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#4AF2FF] px-6 py-3 text-sm font-black text-[#071426] shadow-[0_0_26px_rgba(74,242,255,0.3)] transition hover:bg-[#7df7ff]"
                >
                  Continue to Base Setup
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
              <div className="space-y-3">
                <div className="rounded-[26px] border border-cyan-300/20 bg-[#0B1B33]/90 p-4">
                  <div className="flex items-center gap-2">
                    <NovaBot size="sm" speaking />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-300">
                        NOVA
                      </p>
                      <p className="text-sm font-black">Build your space base</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-white/75">
                    Great! Let&apos;s build our first Habitat. Drag it to the
                    right place.
                  </p>
                  <p className="mt-2 text-[10px] font-semibold leading-relaxed text-cyan-100/60">
                    On a tablet or phone? Tap a card, then tap a green plot.
                  </p>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                      Building parts
                    </p>
                    <span className="text-[10px] font-black text-cyan-200">
                      {placedCount}/4 placed
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {BUILDINGS.map((building) => (
                      <BuildingCard
                        key={building.id}
                        building={building}
                        canPlace={building.id === "habitat" || habitatPlaced}
                        placed={plots.includes(building.id)}
                        selected={selected === building.id}
                        dragging={dragging === building.id}
                        onChoose={() => chooseBuilding(building.id)}
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            "text/plain",
                            building.id,
                          );
                          event.dataTransfer.effectAllowed = "move";
                          setDragging(building.id);
                          setSelected(building.id);
                        }}
                        onDragEnd={() => setDragging(null)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[26px] border border-emerald-300/25 bg-[#06101f] p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                      Build site · {planetLabel}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                        allPlaced
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {allPlaced ? "Ready" : "Place all four"}
                    </span>
                  </div>

                  <BuildSite
                    plots={plots}
                    interactive
                    selected={selected}
                    hoverPlot={hoverPlot}
                    onSelectPlot={(index) => placeBuilding(selected, index)}
                    onDropBuilding={handleDrop}
                    onDragOverPlot={(event, index) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setHoverPlot(index);
                    }}
                    onDragLeavePlot={(index) =>
                      setHoverPlot((current) =>
                        current === index ? null : current,
                      )
                    }
                  />

                  <div
                    className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-semibold leading-relaxed ${
                      allPlaced
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                        : "border-cyan-300/20 bg-cyan-400/5 text-cyan-100/75"
                    }`}
                    role="status"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{message}</span>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-[#081a2e]/90 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                      Base power check
                    </p>
                    <span className="text-[9px] font-bold text-white/40">
                      Start + buildings
                    </span>
                  </div>
                  <MeterBar values={preview} compact />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={resetBuild}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
                  >
                    Start over
                  </button>
                  <motion.button
                    type="button"
                    disabled={!allPlaced}
                    whileTap={reduced || !allPlaced ? undefined : { scale: 0.98 }}
                    onClick={() => goTo(3)}
                    className={`inline-flex items-center justify-center gap-2 rounded-[18px] px-6 py-3 text-sm font-black transition ${
                      allPlaced
                        ? "bg-[#4AF2FF] text-[#071426] shadow-[0_0_26px_rgba(74,242,255,0.3)] hover:bg-[#7df7ff]"
                        : "cursor-not-allowed bg-white/10 text-white/35"
                    }`}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </motion.button>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-[28px] border border-emerald-300/25 bg-[#0B1B33]/90 p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <NovaBot size="md" speaking mood="happy" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                      NOVA
                    </p>
                    <h1 className="text-3xl font-black leading-tight sm:text-4xl">
                      Look at your colony!
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-white/65">
                      Your buildings are working and your base is alive!
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <BuildSite
                    plots={plots}
                    interactive={false}
                    selected={null}
                    hoverPlot={null}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[26px] border border-[#F5C542]/35 bg-[#F5C542]/10 p-4">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-[#F5C542]" aria-hidden />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F5C542]">
                      Mission Goal
                    </p>
                  </div>
                  <p className="mt-1 text-lg font-black leading-tight">
                    Keep your base running and take care of the crew.
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                    You have 10 days. Watch Life Support, Power and Protection
                    every day.
                  </p>
                </div>

                <MissionSummary preview={preview} compact />

                <div className="rounded-[22px] border border-white/10 bg-[#081a2e]/90 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                    Your crew is ready
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CREW.map((member) => (
                      <span
                        key={member.crew}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/70"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  onClick={beginDay}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#F5C542] px-5 py-4 text-base font-black text-[#071426] shadow-[0_0_28px_rgba(245,197,66,0.35)] transition hover:bg-[#ffd75e]"
                >
                  <Rocket className="h-5 w-5" aria-hidden />
                  Begin Day
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </motion.button>

                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="w-full rounded-[16px] border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  Back to build
                </button>
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  );
}
