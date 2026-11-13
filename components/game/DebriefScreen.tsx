"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Star,
  TrendingDown,
  Trophy,
} from "lucide-react";
import { RESOURCE_META, RESOURCE_ORDER } from "@/lib/game/constants";
import { dayLabel } from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey } from "@/lib/game/types";
import { NovaBot, SamiAvatar } from "./Characters";
import { MeterBar } from "./MeterBar";
import { MissionTopBar } from "./MissionTopBar";

export function DebriefScreen() {
  const won = useGameStore((s) => s.won);
  const stars = useGameStore((s) => s.stars);
  const history = useGameStore((s) => s.history);
  const decisions = useGameStore((s) => s.decisions);
  const resources = useGameStore((s) => s.resources);
  const planet = useGameStore((s) => s.planet);
  const day = useGameStore((s) => s.day);
  const missionLength = useGameStore((s) => s.missionLength);
  const baseName = useGameStore((s) => s.baseName);
  const playerName = useGameStore((s) => s.playerName);
  const rescueUsed = useGameStore((s) => s.rescueUsed);
  const replay = useGameStore((s) => s.replay);
  const setScreen = useGameStore((s) => s.setScreen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const width = 520;
  const height = 180;
  const maxStep = Math.max(1, history.length - 1);

  function pathFor(key: ResourceKey) {
    const points = history.length === 1 ? [history[0], history[0]] : history;
    return points
      .map((point, index) => {
        const x = (index / maxStep) * (width - 20) + 10;
        const y = height - (point[key] / 100) * (height - 20) - 10;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  const weakest = RESOURCE_ORDER.reduce((a, b) =>
    resources[a] <= resources[b] ? a : b,
  );
  const strongest = RESOURCE_ORDER.reduce((a, b) =>
    resources[a] >= resources[b] ? a : b,
  );

  const lessons = [
    won
      ? `You kept ${baseName} alive for all ${missionLength} mission days.`
      : `The mission paused on ${dayLabel(planet, day)} when a meter reached zero.`,
    decisions.length > 0
      ? `You made ${decisions.length} captain's decisions, each with a trade-off.`
      : "Every mission starts with a single decision.",
    `${RESOURCE_META[strongest].label} finished strongest at ${resources[strongest]}%.`,
    `${RESOURCE_META[weakest].label} finished weakest at ${resources[weakest]}%.`,
    rescueUsed
      ? "You used your one rescue. Rescues help, but they also carry a cost."
      : "You never needed a rescue operation. That is careful planning.",
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,132,255,0.16),transparent_34%),linear-gradient(180deg,#071426_0%,#0a1d33_45%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <MissionTopBar showMeters={false} />

        <motion.section
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[26px] border p-4 sm:p-5 ${
            won
              ? "border-emerald-300/40 bg-emerald-400/10"
              : "border-rose-400/40 bg-rose-500/10"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                won
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                  : "border-rose-300/40 bg-rose-400/15 text-rose-200"
              }`}
            >
              {won ? <Trophy className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
              Mission report
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              {planet === "mars" ? "Mars Outpost" : "Lunar Outpost"} · {baseName}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <SamiAvatar size="lg" mood={won ? "cheering" : "tired"} />
            <div>
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">
                {won ? "Outpost Secured!" : "A Hard Day for the Base"}
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/65">
                {won
                  ? `Well done, Captain ${playerName.trim() || "Nova"}. The crew is safe and the base is holding.`
                  : "A meter reached zero and could not be rescued. That is a lesson, not a failure — try again with a new plan."}
              </p>
              <div className="mt-2 flex items-center gap-1" aria-label={`${stars} of 3 stars`}>
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`h-6 w-6 ${
                      n <= stars ? "fill-amber-300 text-amber-300" : "text-white/20"
                    }`}
                    aria-hidden
                  />
                ))}
                <span className="ml-2 text-xs font-black text-white/50">
                  {stars} / 3 stars
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[24px] border border-white/10 bg-[#0B1B33]/92 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Final meters
          </p>
          <MeterBar values={resources} />
        </section>

        <section className="overflow-x-auto rounded-[24px] border border-white/10 bg-[#0B1B33]/92 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            How the meters moved
          </p>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[280px]" role="img" aria-label="Resource timeline">
            {[25, 50, 75].map((line) => (
              <line
                key={line}
                x1="10"
                x2={width - 10}
                y1={height - (line / 100) * (height - 20) - 10}
                y2={height - (line / 100) * (height - 20) - 10}
                stroke="rgba(255,255,255,0.08)"
              />
            ))}
            {RESOURCE_ORDER.map((key) => (
              <path
                key={key}
                d={pathFor(key)}
                fill="none"
                stroke={RESOURCE_META[key].color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="mt-2 flex flex-wrap gap-3">
            {RESOURCE_ORDER.map((key) => (
              <span key={key} className="flex items-center gap-1 text-xs font-bold text-white/70">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: RESOURCE_META[key].color }}
                />
                {RESOURCE_META[key].label}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-[24px] border border-cyan-300/25 bg-cyan-400/5 p-4">
            <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              What you learned
            </h2>
            <ul className="mt-2 space-y-2">
              {lessons.map((lesson) => (
                <li key={lesson} className="text-xs font-semibold leading-relaxed text-white/80">
                  • {lesson}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] border border-orange-300/25 bg-orange-300/5 p-4">
            <div className="flex items-center gap-2">
              <NovaBot size="sm" speaking mood={won ? "happy" : "worried"} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">
                NOVA&apos;s note
              </h2>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/85">
              {won
                ? "Great explorers are not perfect. They are curious about trade-offs. Replay and try a different plan to see what changes."
                : "A weak meter is an early warning. Next time, check the weakest meter before choosing your strategy — and remember the rescue is only one helping hand."}
            </p>
          </section>
        </div>

        {decisions.length > 0 && (
          <details className="rounded-[24px] border border-white/10 bg-[#0B1B33]/92 p-4">
            <summary className="cursor-pointer list-none text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
              Your decision log ({decisions.length})
            </summary>
            <ol className="mt-3 space-y-2">
              {decisions.map((decision) => (
                <li
                  key={`${decision.day}-${decision.choiceId}`}
                  className="rounded-xl bg-black/25 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wide text-cyan-200">
                      {dayLabel(planet, decision.day)}
                    </span>
                    <span className="text-[10px] font-semibold text-white/40">
                      {decision.eventTitle}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-black text-white/85">
                    {decision.choiceLabel}
                  </p>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            whileTap={reduced ? undefined : { scale: 0.98 }}
            onClick={replay}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[22px] bg-[#F5C542] px-5 py-4 text-base font-black text-[#071426] transition hover:bg-[#ffd75e]"
          >
            <RotateCcw className="h-5 w-5" aria-hidden />
            Replay mission
          </motion.button>
          <button
            type="button"
            onClick={() => setScreen("title")}
            className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-white/15 bg-white/5 px-5 py-4 text-sm font-black text-white/75 transition hover:text-white"
          >
            Change setup
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
