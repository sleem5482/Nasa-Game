"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, ShieldAlert, Truck } from "lucide-react";
import { RESOURCE_META } from "@/lib/game/constants";
import { formatDelta } from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import { NovaBot, SamiAvatar } from "./Characters";
import { MeterBar } from "./MeterBar";
import { MissionTopBar } from "./MissionTopBar";

export function RescueScreen() {
  const options = useGameStore((s) => s.rescueOptions);
  const resources = useGameStore((s) => s.resources);
  const lastResult = useGameStore((s) => s.lastResult);
  const applyRescue = useGameStore((s) => s.applyRescue);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const emptyKey = lastResult?.rescueNeeded ?? null;
  const emptyLabel = emptyKey ? RESOURCE_META[emptyKey].label : "A meter";
  const hasSafeOption = options.some((option) => option.safe);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,86,86,0.2),transparent_38%),linear-gradient(180deg,#1a0a14_0%,#160b1e_45%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <MissionTopBar showMeters={false} />

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[26px] border-2 border-rose-400/60 bg-rose-500/12 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/50 bg-rose-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-rose-100">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
              Rescue operation
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              One rescue per mission
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <SamiAvatar size="md" mood="sweating" />
            <div>
              <h1 className="text-2xl font-black leading-tight text-rose-100 sm:text-3xl">
                {emptyLabel} is empty!
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/70">
                The crew is safe, Captain. Choose how to refill the meter. There is only
                one rescue, so pick carefully.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[24px] border border-white/10 bg-[#0B1B33]/92 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Where the base stands now
          </p>
          <MeterBar values={resources} />
        </section>

        <div className="grid gap-3">
          {options.map((option) => (
            <motion.button
              key={option.id}
              type="button"
              disabled={!option.safe}
              whileTap={reduced || !option.safe ? undefined : { scale: 0.99 }}
              onClick={() => applyRescue(option.id)}
              className={`w-full rounded-[24px] border p-4 text-left transition ${
                option.safe
                  ? "border-cyan-300/35 bg-cyan-400/8 hover:border-cyan-300/70"
                  : "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    option.safe
                      ? "bg-cyan-400/15 text-cyan-200"
                      : "bg-white/5 text-white/35"
                  }`}
                >
                  {option.id === "earth-resupply" ? (
                    <Truck className="h-5 w-5" aria-hidden />
                  ) : (
                    <ShieldAlert className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black leading-tight">{option.label}</h2>
                    {!option.safe && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/40 bg-rose-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-rose-200">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        Would empty another meter
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-white/60">
                    {option.description}
                  </p>
                  <p className="mt-1.5 text-[11px] font-black text-cyan-200">
                    {formatDelta(option.effects)}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {hasSafeOption && (
          <section className="flex items-start gap-2 rounded-[24px] border border-orange-300/20 bg-orange-300/5 p-3">
            <NovaBot size="sm" speaking mood="worried" />
            <p className="pt-1 text-xs font-semibold leading-relaxed text-orange-50/90">
              <span className="font-black">NOVA says:</span> a rescue is a helping hand,
              not a restart. Read the cost before you choose.
            </p>
          </section>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-white/35">
          <ArrowRight className="h-3 w-3" aria-hidden />
          If no rescue can keep all three meters alive, the mission ends honestly.
        </p>
      </div>
    </div>
  );
}
