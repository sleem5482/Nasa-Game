"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Equal } from "lucide-react";
import { POWER_BUDGET, RESOURCE_META } from "@/lib/game/constants";
import { formatDelta, previewEffects } from "@/lib/game/dayLogic";
import { useGameStore } from "@/lib/game/store";
import type { ModuleId, ResourceKey } from "@/lib/game/types";

const LABELS: Record<ModuleId, string> = {
  habitat: "Habitat / Life Support",
  greenhouse: "Greenhouse",
  power: "Power Station",
  shelter: "Radiation Shelter",
  lab: "Research Lab",
};

export function PowerAllocator() {
  const allocation = useGameStore((s) => s.allocation);
  const planet = useGameStore((s) => s.planet);
  const setAllocation = useGameStore((s) => s.setAllocation);
  const autoBalance = useGameStore((s) => s.autoBalance);
  const beginEndDay = useGameStore((s) => s.beginEndDay);
  const remaining = useGameStore((s) => s.remainingPower());
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const preview = useMemo(() => {
    if (!planet) return {} as Partial<Record<ResourceKey, number>>;
    return previewEffects(allocation, planet);
  }, [allocation, planet]);

  const ready = remaining === 0;

  return (
    <section className="rounded-[24px] bg-[#0B1B33]/95 border border-white/10 p-4 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-white font-black text-lg">Daily Power Budget</h2>
          <p className="text-white/70 text-sm">
            Spend exactly <span className="text-cyan-300 font-bold">{POWER_BUDGET}</span>{" "}
            power units. Overfeeding the lab can starve{" "}
            <span className="font-semibold">Life Support</span>.
          </p>
        </div>
        <div className="rounded-2xl px-3 py-2 bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] uppercase tracking-wide text-white/50 font-bold">
            Remaining
          </div>
          <div
            className={`text-2xl font-black ${remaining === 0 ? "text-emerald-300" : "text-amber-300"}`}
          >
            {remaining}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {(Object.keys(LABELS) as ModuleId[]).map((id) => (
          <label key={id} className="block">
            <div className="flex justify-between text-sm font-bold text-white mb-1">
              <span>{LABELS[id]}</span>
              <span className="text-cyan-300">{allocation[id]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={POWER_BUDGET}
              value={allocation[id]}
              onChange={(e) => setAllocation(id, Number(e.target.value))}
              className="w-full accent-cyan-400 h-2 cursor-pointer"
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl bg-black/25 border border-cyan-400/20 p-3 mb-4">
        <p className="text-xs uppercase tracking-wide text-cyan-300 font-bold mb-1">
          Preview consequences
        </p>
        <p className="text-sm text-white font-semibold">
          {formatDelta(preview) || "Move the sliders to see trade-offs."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(preview) as ResourceKey[]).map((key) => {
            const value = preview[key] ?? 0;
            if (!value) return null;
            return (
              <span
                key={key}
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  value > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {value > 0 ? "+" : ""}
                {value} {RESOURCE_META[key].label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={autoBalance}
          className="inline-flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 font-bold text-white border border-white/20 bg-white/5 hover:bg-white/10"
        >
          <Equal className="w-4 h-4" />
          Quick Balance
        </button>
        <motion.button
          type="button"
          disabled={!ready}
          onClick={beginEndDay}
          whileTap={reduced || !ready ? undefined : { scale: 0.98 }}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 font-black text-base ${
            ready
              ? "bg-[#36D6F5] text-[#071426] shadow-[0_0_24px_rgba(54,214,245,0.35)]"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          End Day / Allocate Power
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </section>
  );
}
