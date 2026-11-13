"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  Home,
  Leaf,
  Microscope,
  Shield,
  Sun,
  Zap,
} from "lucide-react";
import {
  HARVEST_FOOD,
  PLANT_WATER_COST,
  UPGRADE_COST,
  WATER_PER_BED,
} from "@/lib/game/constants";
import { formatDelta } from "@/lib/game/dayLogic";
import { MODULE_ACTIONS } from "@/lib/game/moduleActions";
import { useGameStore } from "@/lib/game/store";
import { ModuleScene } from "./ModuleScenes";
import type { CropPlot, ModuleId, PlotStage, ResourceKey } from "@/lib/game/types";

const MODULE_COPY: Record<
  ModuleId,
  { eyebrow: string; subtitle: string; systems: [string, string][]; tradeoff: string }
> = {
  habitat: {
    eyebrow: "OUTPOST MODULE 01",
    subtitle: "Air, water, health and crew comfort",
    systems: [
      ["Oxygen", "oxygen"],
      ["Temperature", "temperature"],
      ["Water loop", "water"],
      ["Crew", "crew"],
    ],
    tradeoff: "Keeping the habitat comfortable protects the crew, but life support uses energy and water.",
  },
  greenhouse: {
    eyebrow: "OUTPOST MODULE 02",
    subtitle: "Food production and plant research",
    systems: [
      ["Crop health", "food"],
      ["Water flow", "water"],
      ["LED power", "power"],
      ["Harvest", "food"],
    ],
    tradeoff: "Hydroponics can grow more food in less space, but pumps and lights use resources.",
  },
  power: {
    eyebrow: "OUTPOST MODULE 03",
    subtitle: "Solar generation and battery storage",
    systems: [
      ["Solar input", "energy"],
      ["Battery", "battery"],
      ["Base use", "power"],
      ["Reserve", "reserve"],
    ],
    tradeoff: "Bigger batteries improve backup power, but building and maintaining them uses resources.",
  },
  shelter: {
    eyebrow: "OUTPOST MODULE 04",
    subtitle: "Storm safety and emergency planning",
    systems: [
      ["Exposure", "shielding"],
      ["Capacity", "crew"],
      ["Seal", "seal"],
      ["Supplies", "water"],
    ],
    tradeoff: "Improving shelter protection costs energy and crew time needed elsewhere.",
  },
  lab: {
    eyebrow: "OUTPOST MODULE 05",
    subtitle: "Experiments, samples and new technology",
    systems: [
      ["Studies", "studies"],
      ["Samples", "samples"],
      ["Science", "science"],
      ["Power", "power"],
    ],
    tradeoff: "Research can help the whole outpost, but lab equipment draws energy from other systems.",
  },
};

const MODULE_ICONS: Record<ModuleId, typeof Home> = {
  habitat: Home,
  greenhouse: Leaf,
  power: Sun,
  shelter: Shield,
  lab: FlaskConical,
};

const ACTION_ICONS = [Leaf, Zap, Microscope];

function SystemValue({
  moduleId,
  index,
  resources,
  allocation,
}: {
  moduleId: ModuleId;
  index: number;
  resources: ReturnType<typeof useGameStore.getState>["resources"];
  allocation: ReturnType<typeof useGameStore.getState>["allocation"];
}) {
  const key = MODULE_COPY[moduleId].systems[index][1];
  if (key === "temperature") return "21°C";
  if (key === "crew") return "4 safe";
  if (key === "power") return `${allocation[moduleId]} units`;
  if (key === "battery") return `${resources.energy}%`;
  if (key === "reserve") return `${resources.energy}%`;
  if (key === "seal") return "Secure";
  if (key === "studies") return `${Math.max(1, Math.floor(resources.science / 4))} active`;
  if (key === "samples") return `${Math.max(3, resources.science)} stored`;
  const resourceKey = key as ResourceKey;
  return `${resources[resourceKey]}%`;
}

const INTERIOR_IMAGE: Record<ModuleId, string> = {
  habitat: "/images/interior-habitat.jpg",
  greenhouse: "/images/interior-greenhouse.jpg",
  power: "/images/interior-power.jpg",
  shelter: "/images/interior-shelter.jpg",
  lab: "/images/interior-lab.jpg",
};

const PLANT_IMAGE: Record<Exclude<PlotStage, "empty">, string> = {
  seed: "/images/plant-seed.png",
  sprout: "/images/plant-sprout.png",
  growing: "/images/plant-growing.png",
  ready: "/images/plant-ready.png",
  wilted: "/images/plant-wilted.png",
};

const STAGE_LABEL: Record<PlotStage, string> = {
  empty: "Empty bed",
  seed: "Seed",
  sprout: "Sprout",
  growing: "Growing",
  ready: "Ready!",
  wilted: "Wilted",
};

function isGrowing(plot: CropPlot) {
  return plot.stage === "seed" || plot.stage === "sprout" || plot.stage === "growing";
}

function GreenhousePlots({ onResult }: { onResult: (message: string) => void }) {
  const plots = useGameStore((s) => s.plots);
  const water = useGameStore((s) => s.resources.water);
  const actionsLeft = useGameStore((s) => s.crewActionsRemaining);
  const plantPlot = useGameStore((s) => s.plantPlot);
  const harvestPlot = useGameStore((s) => s.harvestPlot);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  function plant(index: number) {
    onResult(
      plantPlot(index)
        ? `Planted! Water it every day so it can grow.`
        : "Not enough water or crew actions to plant.",
    );
  }

  function harvest(index: number) {
    onResult(
      harvestPlot(index)
        ? `Harvest done: +${HARVEST_FOOD} food.`
        : "No crew actions left to harvest.",
    );
  }

  return (
    <div className="absolute inset-x-2 bottom-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {plots.map((plot, index) => {
        const thirsty = isGrowing(plot) && !plot.watered;
        return (
          <div
            key={index}
            className="flex flex-col items-center rounded-2xl border border-white/15 bg-[#071426]/70 p-2 backdrop-blur-sm"
          >
            <div className="relative h-16 w-16 sm:h-20 sm:w-20">
              {plot.stage === "empty" ? (
                <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-white/40 text-2xl text-white/60">
                  +
                </div>
              ) : (
                <motion.div
                  key={plot.stage}
                  className="h-full w-full"
                  initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Image
                    src={PLANT_IMAGE[plot.stage]}
                    alt={STAGE_LABEL[plot.stage]}
                    width={160}
                    height={160}
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              )}
            </div>
            <p className="mt-1 text-[11px] font-black">{STAGE_LABEL[plot.stage]}</p>
            <p
              className={`text-[9px] font-bold ${
                thirsty ? "text-amber-300" : plot.stage === "wilted" ? "text-rose-300" : "text-white/50"
              }`}
            >
              {plot.stage === "empty"
                ? "Ready to plant"
                : plot.stage === "wilted"
                  ? "Too dry for 2 days"
                  : plot.stage === "ready"
                    ? "Harvest it"
                    : thirsty
                      ? "Needs water today"
                      : "Watered today ✓"}
            </p>
            {(plot.stage === "empty" || plot.stage === "wilted") && (
              <button
                type="button"
                disabled={actionsLeft <= 0 || water < PLANT_WATER_COST}
                onClick={() => plant(index)}
                className="mt-1 w-full rounded-lg bg-cyan-400 px-2 py-1 text-[10px] font-black text-[#071426] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {plot.stage === "wilted" ? "Replant" : "Plant"} · -{PLANT_WATER_COST} water
              </button>
            )}
            {plot.stage === "ready" && (
              <button
                type="button"
                disabled={actionsLeft <= 0}
                onClick={() => harvest(index)}
                className="mt-1 w-full rounded-lg bg-yellow-300 px-2 py-1 text-[10px] font-black text-[#071426] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Harvest · +{HARVEST_FOOD} food
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GreenhouseCare({ onResult }: { onResult: (message: string) => void }) {
  const plots = useGameStore((s) => s.plots);
  const water = useGameStore((s) => s.resources.water);
  const actionsLeft = useGameStore((s) => s.crewActionsRemaining);
  const waterPlots = useGameStore((s) => s.waterPlots);

  const thirsty = plots.filter((p) => isGrowing(p) && !p.watered).length;
  const cost = thirsty * WATER_PER_BED;
  const disabled = thirsty === 0 || actionsLeft <= 0 || water < cost;

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4 shadow-lg">
      <h2 className="mb-2 font-black">Grow your food</h2>
      <ol className="mb-3 list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-white/70">
        <li>Plant a seed in an empty bed.</li>
        <li>Water every day. A watered crop grows one stage each morning.</li>
        <li>After about 3 mornings it is ready. Harvest it for food.</li>
        <li>Skip water for 2 days and the crop wilts.</li>
      </ol>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onResult(
            waterPlots()
              ? `Watered ${thirsty} bed${thirsty === 1 ? "" : "s"}.`
              : "Not enough water or crew actions.",
          )
        }
        className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#071426] px-3 py-2.5 text-left text-xs font-black transition hover:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>
          Water all thirsty beds
          <span className="mt-0.5 block text-[9px] font-bold text-cyan-200/70">
            {thirsty === 0 ? "No bed needs water right now" : `${thirsty} thirsty · -${cost} water · 1 crew action`}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 text-white/50" />
      </button>
    </section>
  );
}

function InteriorScene({
  moduleId,
  onResult,
}: {
  moduleId: ModuleId;
  onResult: (message: string) => void;
}) {
  return (
    <div className="absolute inset-2 overflow-hidden rounded-[18px] border border-white/5 bg-[#172f43]">
      <Image
        src={INTERIOR_IMAGE[moduleId]}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 800px, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {moduleId === "greenhouse" && <GreenhousePlots onResult={onResult} />}
      {moduleId !== "greenhouse" && <ModuleScene moduleId={moduleId} onResult={onResult} />}
    </div>
  );
}

export function ModuleInterior() {
  const showModuleId = useGameStore((s) => s.showModuleId);
  const modules = useGameStore((s) => s.modules);
  const resources = useGameStore((s) => s.resources);
  const allocation = useGameStore((s) => s.allocation);
  const crewActionsRemaining = useGameStore((s) => s.crewActionsRemaining);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const openModule = useGameStore((s) => s.openModule);
  const performModuleAction = useGameStore((s) => s.performModuleAction);
  const upgradeModule = useGameStore((s) => s.upgradeModule);
  const [lastDecision, setLastDecision] = useState("");

  const mod = modules.find((module) => module.id === showModuleId);
  if (!mod) return null;

  const copy = MODULE_COPY[mod.id];
  const Icon = MODULE_ICONS[mod.id];
  const actions = MODULE_ACTIONS[mod.id];

  function canAfford(effects: Partial<typeof resources>) {
    return (Object.keys(effects) as ResourceKey[]).every(
      (key) => resources[key] + (effects[key] ?? 0) >= 0,
    );
  }

  function chooseAction(actionId: string, title: string) {
    const success = performModuleAction(actionId);
    setLastDecision(
      success ? `${title} completed.` : "Not enough resources or crew actions for that choice.",
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-3 py-5 text-white sm:px-6 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <div className="mb-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <button
              type="button"
              onClick={() => openModule(null)}
              className="inline-flex items-center gap-2 justify-self-start rounded-full text-sm font-bold text-white/75 transition hover:text-cyan-200"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Outpost
            </button>
            <Image
              src="/images/logo.png"
              alt="Solbound"
              width={677}
              height={369}
              className="h-10 w-auto"
            />
            <span className="justify-self-end text-[9px] font-black uppercase tracking-[0.2em] text-white/35 sm:text-[10px]">Building Interior</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.eyebrow}</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{mod.name}</h1>
              <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
            </div>
            <div className="rounded-xl border border-cyan-300/15 bg-[#10243D] px-4 py-2 text-xs font-black text-cyan-200">
              {crewActionsRemaining} crew action{crewActionsRemaining === 1 ? "" : "s"} left
            </div>
          </div>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,0.72fr)]">
          <motion.section
            className={`relative ${mod.id === "greenhouse" ? "h-[390px]" : "h-[600px]"} overflow-hidden rounded-[26px] border border-cyan-300/10 bg-[#10243D] p-2.5 shadow-[0_20px_55px_rgba(0,0,0,.4)] sm:h-[500px] sm:p-3`}
            initial={reduced ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            <InteriorScene moduleId={mod.id} onResult={setLastDecision} />
          </motion.section>

          <aside className="space-y-3">
            <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">Live systems</h2>
                <span className="flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-1 text-[8px] font-black uppercase text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {mod.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {copy.systems.map(([label], index) => (
                  <div key={label} className="rounded-xl bg-[#071426] px-3 py-2">
                    <p className="text-[9px] font-bold text-white/40">{label}</p>
                    <p className="mt-1 text-sm font-black text-white">
                      <SystemValue moduleId={mod.id} index={index} resources={resources} allocation={allocation} />
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {mod.id === "greenhouse" && <GreenhouseCare onResult={setLastDecision} />}

            <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-black">Available actions</h2>
                <span className="text-[9px] font-bold text-white/40">1 crew action each</span>
              </div>
              <div className="space-y-2">
                {actions.map((action, index) => {
                  const ActionIcon = ACTION_ICONS[index];
                  const affordable = canAfford(action.effects);
                  const disabled = crewActionsRemaining <= 0 || !affordable;
                  return (
                    <motion.button
                      key={action.id}
                      type="button"
                      disabled={disabled}
                      whileHover={disabled || reduced ? undefined : { x: 2 }}
                      whileTap={disabled || reduced ? undefined : { scale: 0.985 }}
                      onClick={() => chooseAction(action.id, action.title)}
                      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                        disabled
                          ? "cursor-not-allowed border-white/5 bg-[#071426]/60 opacity-55"
                          : "border-white/5 bg-[#071426] hover:border-cyan-300/30 hover:bg-[#0a1a2e]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <ActionIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black">{action.title}</span>
                        <span className="mt-1 block text-[9px] leading-relaxed text-white/40">{action.description}</span>
                        <span className="mt-1 block text-[9px] font-bold text-cyan-200/70">{formatDelta(action.effects)} · 1 crew action</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-cyan-200" />
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                {lastDecision && (
                  <motion.p
                    key={lastDecision}
                    className="mt-3 flex items-start gap-2 rounded-xl border border-cyan-300/15 bg-cyan-400/5 p-2.5 text-[10px] font-semibold text-cyan-100"
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {lastDecision}
                  </motion.p>
                )}
              </AnimatePresence>
            </section>

            <section className="rounded-[18px] border border-white/5 bg-[#142236] p-3 text-[10px] leading-relaxed text-amber-100/80">
              <span className="font-black text-amber-200">Engineering trade-off: </span>
              {copy.tradeoff}
            </section>

            <button
              type="button"
              disabled={mod.level >= mod.maxLevel || resources.science < UPGRADE_COST}
              onClick={() => upgradeModule(mod.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon className="h-4 w-4" />
              {mod.level >= mod.maxLevel ? "Module fully upgraded" : `Upgrade module · ${UPGRADE_COST} Science`}
            </button>
          </aside>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-[9px] text-white/30">
          <Zap className="h-3 w-3" /> Each selected action costs one crew action and changes your mission resources.
        </p>
      </div>
    </main>
  );
}
