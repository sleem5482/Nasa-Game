"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Apple,
  Droplets,
  Shield,
  Star,
  Wind,
  Zap,
} from "lucide-react";
import { RESOURCE_META } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey } from "@/lib/game/types";

const ICONS = {
  energy: Zap,
  water: Droplets,
  oxygen: Wind,
  food: Apple,
  shielding: Shield,
  science: Star,
} as const;

// صور الأيقونات (الدرع والعلوم لسه بأيقونات lucide)
const ICON_IMAGES: Partial<Record<ResourceKey, string>> = {
  energy: "/images/icon-energy.png",
  water: "/images/icon-water.png",
  oxygen: "/images/icon-oxygen.png",
  food: "/images/icon-food.png",
};

function Meter({ resourceKey }: { resourceKey: ResourceKey }) {
  const value = useGameStore((s) => s.resources[resourceKey]);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const meta = RESOURCE_META[resourceKey];
  const Icon = ICONS[resourceKey];
  const danger = resourceKey !== "science" && value < 35;
  const percent = Math.min(100, resourceKey === "science" ? value : value);

  return (
    <div className="min-w-0 rounded-[20px] border border-white/10 bg-[#0D1D38]/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-white/70">
        <span className="flex items-center gap-1.5 font-bold">
          {ICON_IMAGES[resourceKey] ? (
            <Image
              src={ICON_IMAGES[resourceKey]!}
              alt=""
              width={32}
              height={32}
              className="h-5 w-5 object-contain"
            />
          ) : (
            <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
          )}
          {meta.label}
        </span>
        <span className={`font-black ${danger ? "text-rose-300" : "text-cyan-200"}`}>
          {resourceKey === "science" ? value : `${value}%`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

export function ResourceBar() {
  const day = useGameStore((s) => s.day);
  const missionLength = useGameStore((s) => s.missionLength);
  const stars = useGameStore((s) => s.stars);
  const toggleMissionControl = useGameStore((s) => s.toggleMissionControl);
  const openDailyLogReview = useGameStore((s) => s.openDailyLogReview);
  const beginEndDay = useGameStore((s) => s.beginEndDay);
  const remainingPower = useGameStore((s) => s.remainingPower());

  return (
    <header className="w-full rounded-[24px] border border-white/10 bg-[#081a2e]/95 px-3 py-3 shadow-[0_10px_35px_rgba(1,7,18,0.55)] backdrop-blur-sm sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <Image
          src="/images/logo.png"
          alt="Solbound"
          width={677}
          height={369}
          className="h-11 w-auto"
        />

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0B1B33]/70 px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/50">Earth Day</div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-cyan-200">
            <span>{day}</span>
            <span className="text-white/30">/</span>
            <span>{missionLength}</span>
          </div>
          <div className="ml-1 flex items-center gap-1">
            {Array.from({ length: missionLength }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${index < day ? "bg-cyan-300" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
            Mission Points
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/40 bg-[#0F243E] text-sm font-black text-cyan-200">
            {stars}
          </div>
          <button
            type="button"
            onClick={() => toggleMissionControl(true)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-cyan-300/40 hover:text-cyan-200"
          >
            Mission Control
          </button>
          <button
            type="button"
            onClick={openDailyLogReview}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-amber-300/40 hover:text-amber-200"
          >
            Comic
          </button>
          <button
            type="button"
            disabled={remainingPower !== 0}
            onClick={beginEndDay}
            className="rounded-full bg-[#F5C542] px-3 py-1.5 text-xs font-black text-[#071426] shadow-[0_0_18px_rgba(245,197,66,0.35)] transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            End Day
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(RESOURCE_META) as ResourceKey[]).map((key) => (
          <Meter key={key} resourceKey={key} />
        ))}
      </div>
    </header>
  );
}
