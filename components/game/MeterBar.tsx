"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Wind, Zap } from "lucide-react";
import { RESOURCE_META, RESOURCE_ORDER } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey, Resources } from "@/lib/game/types";

const ICONS = {
  lifeSupport: Wind,
  power: Zap,
  protection: Shield,
} as const;

const ICON_IMAGES: Partial<Record<ResourceKey, string>> = {
  lifeSupport: "/images/icon-oxygen.png",
  power: "/images/icon-energy.png",
};

export function meterStatus(value: number): { label: string; tone: "ok" | "warn" | "critical" } {
  if (value <= 0) return { label: "EMPTY", tone: "critical" };
  if (value < 25) return { label: "CRITICAL", tone: "critical" };
  if (value < 45) return { label: "LOW", tone: "warn" };
  return { label: "OK", tone: "ok" };
}

export function MeterBar({
  values,
  compact = false,
}: {
  values?: Resources;
  compact?: boolean;
}) {
  const storeResources = useGameStore((s) => s.resources);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const resources = values ?? storeResources;

  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3"}`}>
      {RESOURCE_ORDER.map((key) => {
        const meta = RESOURCE_META[key];
        const Icon = ICONS[key];
        const value = resources[key];
        const status = meterStatus(value);
        return (
          <div
            key={key}
            className={`rounded-2xl border px-3 py-2.5 ${
              status.tone === "critical"
                ? "border-rose-400/50 bg-rose-500/10"
                : status.tone === "warn"
                  ? "border-amber-300/40 bg-amber-400/10"
                  : "border-white/10 bg-[#0D1D38]/85"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/75">
                {ICON_IMAGES[key] ? (
                  <Image
                    src={ICON_IMAGES[key]!}
                    alt=""
                    width={32}
                    height={32}
                    className="h-4 w-4 object-contain"
                  />
                ) : (
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} aria-hidden />
                )}
                <span className="truncate">{meta.label}</span>
              </span>
              <span
                className={`shrink-0 text-sm font-black ${
                  status.tone === "critical"
                    ? "text-rose-300"
                    : status.tone === "warn"
                      ? "text-amber-200"
                      : "text-cyan-200"
                }`}
              >
                {value}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: meta.color }}
                initial={false}
                animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
            {!compact && (
              <p className="mt-1 text-[10px] font-semibold text-white/40">
                {status.label} · {meta.short}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
