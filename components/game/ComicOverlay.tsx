"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import nasaData from "@/data/nasa_archived_data.json";
import { RESOURCE_META } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import { SamiAvatar, NovaBot } from "./Characters";

export function ComicOverlay() {
  const dayLogs = useGameStore((s) => s.dayLogs);
  const closeComicContinue = useGameStore((s) => s.closeComicContinue);
  const setScreen = useGameStore((s) => s.setScreen);
  const screen = useGameStore((s) => s.screen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const log = dayLogs[dayLogs.length - 1];

  if (!log) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#071426] text-white">
        <button type="button" onClick={() => setScreen("dashboard")}>
          Back to base
        </button>
      </div>
    );
  }

  const panels = [
    {
      title: "Sami's Recap",
      body: log.samiLine,
      art: <SamiAvatar size="sm" mood="focused" />,
    },
    {
      title: "Today's Event",
      body: log.eventTitle
        ? `${log.eventTitle} — chose “${log.choiceLabel}”.`
        : "A quiet operations day.",
      art: <span className="text-3xl">📡</span>,
    },
    {
      title: "Power In / Out",
      body: `Generated ~${log.powerGenerated} units. Spent 10 across Habitat ${log.powerUsed.habitat}, Greenhouse ${log.powerUsed.greenhouse}, Power ${log.powerUsed.power}, Shelter ${log.powerUsed.shelter}, Lab ${log.powerUsed.lab}.`,
      art: <span className="text-3xl">⚡</span>,
    },
    {
      title: "Weakest Link",
      body: `${RESOURCE_META[log.weakestResource].label} is the softest meter tonight at ${log.resourcesAfter[log.weakestResource]}${log.weakestResource === "science" ? "" : "%"}.`,
      art: <span className="text-3xl">📉</span>,
    },
    {
      title: "NASA Science Fact",
      body: log.nasaFact,
      art: <NovaBot size="sm" />,
    },
    {
      title: "Crew Motto",
      body: "No choice is free. Saving power today might cost oxygen tomorrow—and that is how explorers learn.",
      art: <span className="text-3xl">🚀</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071426] to-[#10243D] text-white px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-black text-2xl sm:text-3xl">Daily Log Comic</h2>
            <p className="text-white/70 text-sm">
              Day {log.day} · 6-panel mission scrapbook
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/15 border border-yellow-300/40 px-3 py-1.5 text-yellow-200 text-xs font-bold">
            <BadgeCheck className="w-4 h-4" />
            {nasaData.badge}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {panels.map((panel, i) => (
            <motion.article
              key={panel.title}
              className="rounded-[24px] bg-[#0B1B33]/95 border-2 border-white/15 p-4 min-h-[180px] flex flex-col"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wide text-cyan-300">
                  Panel {i + 1}
                </span>
                {panel.art}
              </div>
              <h3 className="font-black mb-2">{panel.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed flex-1">
                {panel.body}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={reduced ? undefined : { scale: 0.98 }}
          onClick={() => {
            if (screen === "comic") closeComicContinue();
            else setScreen("dashboard");
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[24px] bg-[#36D6F5] text-[#071426] font-black px-6 py-4"
        >
          Continue Mission
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
