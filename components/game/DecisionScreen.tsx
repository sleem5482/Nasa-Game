"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Power, ThumbsDown, ThumbsUp } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import type { DecisionChoice } from "@/lib/game/types";
import { NovaBot } from "./Characters";
import { MeterBar } from "./MeterBar";
import { MissionTopBar } from "./MissionTopBar";

const LETTERS = ["A", "B", "C"];

export function DecisionScreen() {
  const event = useGameStore((s) => s.activeEvent);
  const chooseStrategy = useGameStore((s) => s.chooseStrategy);
  const setScreen = useGameStore((s) => s.setScreen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const [selected, setSelected] = useState<DecisionChoice | null>(null);

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,197,66,0.12),transparent_34%),linear-gradient(180deg,#071426_0%,#0a1d33_50%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <MissionTopBar />

        <section className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
            Captain&apos;s decision
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
            Choose your strategy
          </h1>
          <p className="mt-1 text-sm font-semibold text-white/60">
            {event.title} — how will you protect the base today?
          </p>
          <div className="mt-3">
            <MeterBar compact />
          </div>
        </section>

        <div className="grid gap-3">
          {event.choices.map((choice, index) => {
            const active = selected?.id === choice.id;
            return (
              <motion.button
                key={choice.id}
                type="button"
                whileTap={reduced ? undefined : { scale: 0.995 }}
                onClick={() => setSelected(choice)}
                aria-pressed={active}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  active
                    ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_24px_rgba(54,214,245,0.12)]"
                    : "border-white/10 bg-[#0B1B33]/85 hover:border-white/25"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                      active
                        ? "border-cyan-300 bg-cyan-400 text-[#071426]"
                        : "border-white/20 text-white/55"
                    }`}
                  >
                    {active ? <Check className="h-4 w-4" aria-hidden /> : LETTERS[index]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black leading-tight">{choice.label}</h2>
                      {choice.requiresPowerPlan && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-200">
                          <Power className="h-3 w-3" aria-hidden />
                          Power plan
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-white/55">
                      {choice.description}
                    </p>

                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      <p className="flex items-start gap-1.5 rounded-xl border border-emerald-300/15 bg-emerald-400/8 px-2.5 py-2 text-[11px] font-semibold leading-relaxed text-emerald-100/90">
                        <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {choice.upside}
                      </p>
                      <p className="flex items-start gap-1.5 rounded-xl border border-amber-300/15 bg-amber-400/8 px-2.5 py-2 text-[11px] font-semibold leading-relaxed text-amber-100/90">
                        <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        {choice.downside}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <section className="flex items-start gap-2 rounded-[24px] border border-orange-300/20 bg-orange-300/5 p-3">
          <NovaBot size="sm" speaking mood="thinking" />
          <p className="pt-1 text-xs font-semibold leading-relaxed text-orange-50/90">
            <span className="font-black">NOVA asks:</span> every choice costs something. Which cost can your
            base afford today?
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScreen("event")}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Read the warning again
          </button>
          <motion.button
            type="button"
            disabled={!selected}
            whileTap={reduced || !selected ? undefined : { scale: 0.98 }}
            onClick={() => selected && chooseStrategy(selected)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-[#071426] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/30 disabled:text-[#071426]/60"
          >
            {selected?.requiresPowerPlan ? "Next: choose machines" : "Confirm decision"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
