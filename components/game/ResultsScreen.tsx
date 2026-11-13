"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { RESOURCE_META, RESOURCE_ORDER } from "@/lib/game/constants";
import { dayLabel, formatDelta } from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey } from "@/lib/game/types";
import { NovaBot, SamiAvatar } from "./Characters";
import { MissionTopBar } from "./MissionTopBar";

const TONE = {
  great: {
    label: "Decision results",
    title: "Base Protected",
    badge: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
    line: "text-emerald-200",
    icon: CheckCircle2,
  },
  ok: {
    label: "Decision results",
    title: "A Careful Day",
    badge: "border-cyan-300/40 bg-cyan-400/15 text-cyan-200",
    line: "text-cyan-200",
    icon: CheckCircle2,
  },
  danger: {
    label: "Decision results",
    title: "The Base Needs Help",
    badge: "border-rose-400/40 bg-rose-500/15 text-rose-200",
    line: "text-rose-200",
    icon: AlertTriangle,
  },
} as const;

function DeltaIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="h-4 w-4 text-emerald-300" aria-hidden />;
  if (value < 0) return <TrendingDown className="h-4 w-4 text-rose-300" aria-hidden />;
  return <Minus className="h-4 w-4 text-white/30" aria-hidden />;
}

export function ResultsScreen() {
  const result = useGameStore((s) => s.lastResult);
  const planet = useGameStore((s) => s.planet);
  const day = useGameStore((s) => s.day);
  const missionLength = useGameStore((s) => s.missionLength);
  const continueFromResults = useGameStore((s) => s.continueFromResults);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  if (!result) return null;
  const tone = TONE[result.tone];
  const ToneIcon = tone.icon;
  const isLastDay = day >= missionLength;
  const rescued = result.rescueNeeded !== null;
  const cta = rescued
    ? "Rescue the base"
    : isLastDay
      ? "See the mission report"
      : "Next day";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,132,255,0.14),transparent_34%),linear-gradient(180deg,#071426_0%,#091c31_40%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <MissionTopBar showMeters={false} />

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[26px] border border-white/10 bg-[#0B1B33]/92 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${tone.badge}`}>
              <ToneIcon className="h-3.5 w-3.5" aria-hidden />
              {tone.label}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
              {dayLabel(planet, day)} · {result.eventTitle || "Mission day"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <SamiAvatar size="md" mood={result.tone === "great" ? "cheering" : result.tone === "ok" ? "focused" : "worried"} />
            <div>
              <h1 className={`text-2xl font-black leading-tight sm:text-3xl ${tone.line}`}>
                {rescued ? "Emergency! A Meter Is Empty" : tone.title}
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/60">
                {rescued
                  ? "The crew is safe, but the base needs help right now."
                  : result.tone === "great"
                    ? "Well done, Captain. Your plan kept the important systems running."
                    : result.tone === "ok"
                      ? "The base survived. One meter is asking for attention."
                      : "That plan cost more than the base could spare."}
              </p>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[26px] border border-white/10 bg-[#0B1B33]/92 p-4 sm:p-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Resource changes
          </h2>
          <div className="mt-2 grid gap-2">
            {RESOURCE_ORDER.map((key: ResourceKey) => {
              const before = result.before[key];
              const after = result.after[key];
              const delta = after - before;
              const meta = RESOURCE_META[key];
              return (
                <div key={key} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#071426] px-3 py-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="min-w-0 flex-1 text-xs font-black">{meta.label}</span>
                  <span className="flex items-center gap-2 text-xs font-black text-white/60">
                    {before}%
                    <ArrowRight className="h-3.5 w-3.5 text-white/25" aria-hidden />
                    <span className={after < 25 ? "text-rose-300" : "text-white"}>{after}%</span>
                  </span>
                  <span
                    className={`flex w-14 items-center justify-end gap-1 text-xs font-black ${
                      delta > 0 ? "text-emerald-300" : delta < 0 ? "text-rose-300" : "text-white/35"
                    }`}
                  >
                    <DeltaIcon value={delta} />
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {result.steps.length > 0 && (
          <details className="rounded-[24px] border border-white/10 bg-[#0B1B33]/92 p-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
              Why did the meters change?
            </summary>
            <ul className="mt-3 space-y-2">
              {result.steps.map((step) => (
                <li key={step.label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
                  <span className="text-[11px] font-semibold text-white/70">{step.label}</span>
                  <span className="text-[10px] font-black text-cyan-200">{formatDelta(step.delta)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] font-semibold text-white/35">
              These are game values. In a real mission, engineers calculate them from power, air and water use.
            </p>
          </details>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-[24px] border border-orange-300/25 bg-orange-300/5 p-4">
            <div className="flex items-center gap-2">
              <NovaBot size="sm" speaking mood={result.tone === "danger" ? "worried" : "happy"} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">
                Nova&apos;s lesson
              </h2>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/85">{result.lesson}</p>
          </section>

          <section className="rounded-[24px] border border-cyan-300/25 bg-cyan-400/5 p-4">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-cyan-300" aria-hidden />
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                What did you learn?
              </h2>
            </div>
            <p className="mt-2 text-sm font-black leading-relaxed text-white">{result.takeaway}</p>
          </section>
        </div>

        <motion.button
          type="button"
          whileTap={reduced ? undefined : { scale: 0.98 }}
          onClick={continueFromResults}
          className={`flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-base font-black text-[#071426] transition ${
            rescued
              ? "bg-rose-300 hover:bg-rose-200"
              : "bg-[#F5C542] hover:bg-[#ffd75e]"
          }`}
        >
          {cta}
          <ArrowRight className="h-5 w-5" aria-hidden />
        </motion.button>
      </div>
    </div>
  );
}
