"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import nasaData from "@/data/nasa_archived_data.json";
import { archived } from "@/lib/game/dataSource";
import { useGameStore } from "@/lib/game/store";
import { GlossaryTooltip } from "./GlossaryTooltip";
import { SourceTag } from "./SourceTag";

export function ScienceLibrary() {
  const open = useGameStore((s) => s.showScienceLibrary);
  const toggle = useGameStore((s) => s.toggleScienceLibrary);
  const unlocked = useGameStore((s) => s.scienceUnlocked);
  const accessibility = useGameStore((s) => s.accessibility);
  const toggleLargeText = useGameStore((s) => s.toggleLargeText);
  const toggleReducedMotion = useGameStore((s) => s.toggleReducedMotion);
  const reduced = accessibility.reducedMotion;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          onClick={() => toggle(false)}
        >
          <motion.div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] bg-[#10243D] border border-cyan-400/30 p-5 shadow-2xl"
            initial={reduced ? false : { y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <SourceTag source={archived("NASA")} />
                <h2 className="text-2xl font-black text-white">Science Library</h2>
              </div>
              <button
                type="button"
                aria-label="Close library"
                onClick={() => toggle(false)}
                className="rounded-full p-2 bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/70 text-sm mb-4">{nasaData.sourceNote}</p>

            <section className="mb-5">
              <h3 className="font-black text-cyan-300 mb-2">Accessibility</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleLargeText}
                  className="rounded-full px-3 py-2 text-sm font-bold bg-white/10 text-white"
                >
                  Large text: {accessibility.largeText ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  onClick={toggleReducedMotion}
                  className="rounded-full px-3 py-2 text-sm font-bold bg-white/10 text-white"
                >
                  Reduced motion: {accessibility.reducedMotion ? "On" : "Off"}
                </button>
              </div>
            </section>

            <section className="mb-5">
              <h3 className="font-black text-cyan-300 mb-2">Glossary</h3>
              <ul className="space-y-2 text-sm text-white/85">
                {nasaData.glossarySeed.map((item) => (
                  <li key={item.term} className="rounded-2xl bg-black/25 p-3">
                    <GlossaryTooltip term={item.term}>{item.term}</GlossaryTooltip>
                    <span className="text-white/70"> — {item.definition}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-5">
              <h3 className="font-black text-cyan-300 mb-2">Solar Weather (DONKI-style)</h3>
              <ul className="space-y-2 text-sm">
                {nasaData.solarFlares.map((f) => (
                  <li key={f.id} className="rounded-2xl bg-black/25 p-3">
                    <div className="font-bold text-white">{f.name}</div>
                    <p className="text-white/75">{f.kidFact}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-5">
              <h3 className="font-black text-cyan-300 mb-2">Martian Dust</h3>
              <ul className="space-y-2 text-sm">
                {nasaData.martianDust.map((f) => (
                  <li key={f.id} className="rounded-2xl bg-black/25 p-3">
                    <div className="font-bold text-white">{f.name}</div>
                    <p className="text-white/75">{f.kidFact}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-black text-cyan-300 mb-2">Unlocked this run</h3>
              {unlocked.length === 0 ? (
                <p className="text-white/60 text-sm">Play days to unlock tags.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unlocked.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-yellow-400/15 border border-yellow-300/30 px-3 py-1 text-xs font-bold text-yellow-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
