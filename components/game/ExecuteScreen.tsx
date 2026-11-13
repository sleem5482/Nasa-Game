"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  FlaskConical,
  Leaf,
  Lightbulb,
  Lock,
  Wind,
} from "lucide-react";
import { OUTPOST_SYSTEMS, RESOURCE_ORDER, SYSTEM_BY_ID } from "@/lib/game/constants";
import {
  formatDelta,
  powerDraw,
  previewResourceChange,
  solarOutput,
} from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import type { SystemId } from "@/lib/game/types";
import { NovaBot } from "./Characters";
import { MeterBar } from "./MeterBar";
import { MissionTopBar } from "./MissionTopBar";

const ICONS = {
  wind: Wind,
  leaf: Leaf,
  flask: FlaskConical,
  bulb: Lightbulb,
} as const;

export function ExecuteScreen() {
  const event = useGameStore((s) => s.activeEvent);
  const choice = useGameStore((s) => s.chosenChoice);
  const planet = useGameStore((s) => s.planet);
  const day = useGameStore((s) => s.day);
  const resources = useGameStore((s) => s.resources);
  const systems = useGameStore((s) => s.systems);
  const setSystem = useGameStore((s) => s.setSystem);
  const confirmPowerPlan = useGameStore((s) => s.confirmPowerPlan);
  const setScreen = useGameStore((s) => s.setScreen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  if (!event || !choice || !planet) return null;

  const selectedCount = OUTPOST_SYSTEMS.filter((system) => systems[system.id]).length;
  const draw = powerDraw(systems);
  const output = solarOutput(planet, day);
  const preview = previewResourceChange(resources, planet, day, choice, systems);
  const willEmpty = RESOURCE_ORDER.some((key) => preview[key] <= 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,214,245,0.12),transparent_36%),linear-gradient(180deg,#071426_0%,#0a1d33_50%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <MissionTopBar />

        <section className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
            Execute actions
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
            Which machines should keep running?
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/60">
            You chose <span className="text-cyan-200">{choice.label}</span>. Now spend today&apos;s power
            carefully.
          </p>
        </section>

        <div className="grid gap-3">
          {OUTPOST_SYSTEMS.map((system) => {
            const Icon = ICONS[system.icon];
            const on = systems[system.id];
            const effects = on ? system.effects : system.offEffects ?? {};
            return (
              <div
                key={system.id}
                className={`rounded-[22px] border p-3 transition ${
                  on ? "border-cyan-300/25 bg-cyan-400/8" : "border-white/10 bg-[#071426]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      on ? "bg-cyan-400/15 text-cyan-200" : "bg-white/5 text-white/35"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-black">{system.name}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                          on ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200"
                        }`}
                      >
                        {on ? "Running" : "Stopped"}
                      </span>
                      {system.essential && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white/50">
                          <Lock className="h-2.5 w-2.5" aria-hidden />
                          Must stay on
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold leading-relaxed text-white/55">
                      {system.summary}
                    </p>
                    <p className="mt-1 text-[10px] font-black text-white/45">
                      {on ? `Uses ${system.powerCost} power` : "Uses 0 power"}
                      {formatDelta(effects) ? ` · ${formatDelta(effects)}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${system.name} ${on ? "on" : "off"}`}
                    disabled={system.essential}
                    onClick={() => setSystem(system.id as SystemId, !on)}
                    className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
                      on ? "border-cyan-300/50 bg-cyan-400/40" : "border-white/15 bg-white/10"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        on ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <section className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BatteryCharging className="h-4 w-4 text-yellow-300" aria-hidden />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Today&apos;s power
              </span>
            </div>
            <span className="text-xs font-black text-white/70">
              Solar +{output} · Machines −{draw} ·{" "}
              <span className={output - draw < 0 ? "text-amber-200" : "text-emerald-200"}>
                Net {output - draw > 0 ? "+" : ""}
                {output - draw}
              </span>
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
            <span>
              Your selected systems: {selectedCount} / {OUTPOST_SYSTEMS.length}
            </span>
            <span>{powerDraw(systems)} power used</span>
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              If you confirm, the base will look like this
            </p>
            <MeterBar values={preview} compact />
          </div>

          {willEmpty && (
            <p className="mt-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-100">
              Careful! This plan would empty a meter. The base may need a rescue operation.
            </p>
          )}
        </section>

        <section className="flex items-start gap-2 rounded-[24px] border border-orange-300/20 bg-orange-300/5 p-3">
          <NovaBot size="sm" speaking mood="thinking" />
          <p className="pt-1 text-xs font-semibold leading-relaxed text-orange-50/90">
            <span className="font-black">NOVA says:</span> the Oxygen System must stay on so the crew can
            breathe. Everything else is your choice — and every choice uses power.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScreen("decision")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Change strategy
          </button>
          <motion.button
            type="button"
            whileTap={reduced ? undefined : { scale: 0.98 }}
            onClick={confirmPowerPlan}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-[#071426] transition hover:bg-cyan-300"
          >
            End the day
            <ArrowRight className="h-4 w-4" aria-hidden />
          </motion.button>
        </div>

        <p className="text-center text-[10px] font-semibold text-white/30">
          {SYSTEM_BY_ID.oxygen.name} is locked on: safety limits come before saving power.
        </p>
      </div>
    </div>
  );
}
