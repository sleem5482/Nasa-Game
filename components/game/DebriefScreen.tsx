"use client";

import { motion } from "framer-motion";
import { RotateCcw, Star } from "lucide-react";
import { RESOURCE_META } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey } from "@/lib/game/types";
import { SamiAvatar, NovaBot } from "./Characters";

const TRACKED: ResourceKey[] = [
  "energy",
  "water",
  "oxygen",
  "food",
  "shielding",
];

export function DebriefScreen() {
  const won = useGameStore((s) => s.won);
  const stars = useGameStore((s) => s.stars);
  const history = useGameStore((s) => s.history);
  const dayLogs = useGameStore((s) => s.dayLogs);
  const planet = useGameStore((s) => s.planet);
  const replay = useGameStore((s) => s.replay);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const last = history[history.length - 1];
  const width = 520;
  const height = 180;
  const maxDay = Math.max(1, history.length - 1);

  function pathFor(key: ResourceKey) {
    if (history.length < 2) return "";
    return history
      .map((point, i) => {
        const x = (i / maxDay) * (width - 20) + 10;
        const y = height - (point[key] / 100) * (height - 20) - 10;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }

  const lessons = [
    won
      ? "You finished the 30-day stretch with a living crew. That takes careful budgeting!"
      : "A meter hit zero—that’s a tough lesson, not a punishment. Try again with new trade-offs.",
    dayLogs.length
      ? `You faced ${dayLogs.length} mission days of events and power choices.`
      : "Every day is a new chance to practice.",
    last
      ? `Final soft spot: ${RESOURCE_META[TRACKED.reduce((a, b) => (last[a] < last[b] ? a : b))].label}.`
      : "",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071426] to-[#10243D] text-white px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <SamiAvatar size="lg" mood={won ? "cheering" : "tired"} />
          <div>
            <p className="text-cyan-300 text-xs font-bold uppercase tracking-wide">
              Mission Debrief · {planet === "mars" ? "Mars" : "Moon"}
            </p>
            <h1 className="font-black text-3xl sm:text-4xl">
              {won ? "Outpost Secured!" : "Mission Pause — Learn & Retry"}
            </h1>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-7 h-7 ${n <= stars ? "fill-yellow-300 text-yellow-300" : "text-white/25"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#0B1B33]/95 border border-white/10 p-4 sm:p-5 mb-5 overflow-x-auto">
          <h2 className="font-black mb-3">Resource Timeline</h2>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[280px]">
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
            {TRACKED.map((key) => (
              <path
                key={key}
                d={pathFor(key)}
                fill="none"
                stroke={RESOURCE_META[key].color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="flex flex-wrap gap-3 mt-2">
            {TRACKED.map((key) => (
              <span key={key} className="text-xs font-bold flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: RESOURCE_META[key].color }}
                />
                {RESOURCE_META[key].label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-4 mb-6">
          <div className="rounded-[24px] bg-[#0B1B33]/95 border border-cyan-400/20 p-5">
            <h2 className="font-black text-xl mb-3">What you learned</h2>
            <ul className="space-y-3">
              {lessons.map((lesson) => (
                <li key={lesson} className="text-white/85 font-semibold leading-relaxed">
                  • {lesson}
                </li>
              ))}
              <li className="text-white/85 font-semibold leading-relaxed">
                • Risk management means noticing weak meters early and spending power
                where life depends on it.
              </li>
            </ul>
          </div>
          <div className="rounded-[24px] bg-[#0B1B33]/95 border border-orange-400/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <NovaBot size="sm" speaking />
              <h2 className="font-black">NOVA&apos;s note</h2>
            </div>
            <p className="text-white/85 font-semibold leading-relaxed">
              Great explorers aren&apos;t perfect—they&apos;re curious about trade-offs.
              Replay and try a different power style!
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={reduced ? undefined : { scale: 0.98 }}
          onClick={replay}
          className="inline-flex items-center gap-2 rounded-[24px] bg-[#36D6F5] text-[#071426] font-black px-6 py-4"
        >
          <RotateCcw className="w-5 h-5" />
          Replay Mission
        </motion.button>
      </div>
    </div>
  );
}
