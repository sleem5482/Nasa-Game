"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Apple,
  Droplets,
  Shield,
  Star,
  Wind,
  Zap,
  AlertTriangle,
  ArrowRight,
  Check,
} from "lucide-react";
import { crewDisplayName } from "@/lib/game/events";
import { formatDelta } from "@/lib/game/dayLogic";
import { RESOURCE_META } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import { CrewPortrait, NovaBot } from "./Characters";
import type { ResourceKey } from "@/lib/game/types";

// صورة لكل حدث
const EVENT_IMAGES: Record<string, string> = {
  "solar-flare": "/images/event-flare.jpg",
  "dust-storm": "/images/event-dust.jpg",
  "lunar-night": "/images/event-night.jpg",
  "filter-glitch": "/images/event-equipment.jpg",
  "comms-delay": "/images/event-night.jpg",
  "dust-seal": "/images/event-dust.jpg",
  "greenhouse-wilt": "/images/interior-greenhouse.jpg",
  "science-breakthrough": "/images/interior-lab.jpg",
};

const ICON_IMAGES: Partial<Record<ResourceKey, string>> = {
  energy: "/images/icon-energy.png",
  water: "/images/icon-water.png",
  oxygen: "/images/icon-oxygen.png",
  food: "/images/icon-food.png",
};

const RESOURCE_ICONS = {
  energy: Zap,
  water: Droplets,
  oxygen: Wind,
  food: Apple,
  shielding: Shield,
  science: Star,
} as const;

export function EventModal() {
  const event = useGameStore((s) => s.activeEvent);
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice);
  const resources = useGameStore((s) => s.resources);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  if (!event) return null;
  const selectedChoice = event.choices.find(
    (choice) => choice.id === selectedChoiceId,
  );
  const resourceKeys: ResourceKey[] = [
    "energy",
    "water",
    "oxygen",
    "food",
    "shielding",
    "science",
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_35%_50%,rgba(62,115,148,.38),transparent_44%),linear-gradient(115deg,#08192b,#071426_60%)] px-4 py-6 text-white sm:px-7">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(450px,.95fr)]">
      <div className="relative hidden min-h-[560px] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl lg:block">
        <Image
          src={EVENT_IMAGES[event.id] ?? "/images/event-flare.jpg"}
          alt={event.title}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <p className="absolute bottom-4 left-5 right-5 text-lg font-black drop-shadow">{event.title}</p>
      </div>
      <motion.div
        className="mx-auto w-full max-w-xl rounded-[24px] border border-cyan-300/15 bg-[#0B1B33]/95 p-4 shadow-2xl backdrop-blur sm:p-5 lg:mx-0"
        initial={reduced ? false : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="hidden sm:block"><CrewPortrait crew={event.crew} /></div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
              <AlertTriangle className="h-3.5 w-3.5" /> Mission event · {crewDisplayName(event.crew)}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">{event.title}</h1>
            <p className="mt-1 text-xs leading-relaxed text-white/60">{event.story}</p>
          </div>
        </div>

        <section className="mb-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {resourceKeys.map((key) => {
            const Icon = RESOURCE_ICONS[key];
            const value = resources[key];
            const danger = key !== "science" && value < 40;
            return (
              <div key={key} className="rounded-xl border border-white/5 bg-[#10243D] px-2.5 py-2">
                <div className="mb-1 flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase text-white/55">
                    {ICON_IMAGES[key] ? (
                      <Image src={ICON_IMAGES[key]!} alt="" width={24} height={24} className="h-4 w-4 object-contain" />
                    ) : (
                      <Icon className="h-3 w-3" style={{ color: RESOURCE_META[key].color }} />
                    )}
                    {key === "shielding" ? "Crew safety" : RESOURCE_META[key].label}
                  </span>
                  <span className={`text-[8px] font-black ${danger ? "text-amber-300" : "text-cyan-300"}`}>
                    {danger ? "LOW" : "OK"}
                  </span>
                </div>
                <div className="text-[11px] font-black">{value}{key === "science" ? " ★" : "/100"}</div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, backgroundColor: RESOURCE_META[key].color }} />
                </div>
              </div>
            );
          })}
        </section>

        <div className="mb-3 flex items-start gap-2 rounded-xl border border-orange-300/10 bg-orange-300/5 p-2.5">
          <NovaBot size="sm" speaking />
          <p className="pt-1 text-[10px] font-semibold leading-relaxed text-orange-100/90">
            <span className="font-black">What can you do?</span> Compare the cost of each strategy with the systems your crew needs most.
          </p>
        </div>

        <h2 className="mb-2 text-xs font-black">Choose a strategy</h2>
        <div className="grid gap-1.5">
          {event.choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              type="button"
              whileTap={reduced ? undefined : { scale: 0.99 }}
              onClick={() => setSelectedChoiceId(choice.id)}
              aria-pressed={selectedChoiceId === choice.id}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedChoiceId === choice.id
                  ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_18px_rgba(54,214,245,.08)]"
                  : "border-white/10 bg-[#071426] hover:border-white/25"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${
                  selectedChoiceId === choice.id
                    ? "border-cyan-300 bg-cyan-400 text-[#071426]"
                    : "border-white/20 text-white/60"
                }`}>
                  {selectedChoiceId === choice.id ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black">{choice.label}</span>
                  <span className="mt-0.5 block text-[9px] leading-relaxed text-white/50">{choice.description}</span>
                  <span className="mt-1 block text-[9px] font-black text-cyan-200">{formatDelta(choice.effects) || "No direct resource change"}</span>
                </span>
                <span className={`shrink-0 text-[9px] font-black ${
                  selectedChoiceId === choice.id ? "text-cyan-200" : "text-white/35"
                }`}>
                  {selectedChoiceId === choice.id ? "Selected" : "Choose"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <details className="mt-2 overflow-hidden rounded-xl bg-[#10243D] open:border open:border-cyan-300/10">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-[10px] font-black text-cyan-300">
            <span className="mr-2">▸</span> Science behind it
          </summary>
          <p className="px-3 pb-3 text-[9px] leading-relaxed text-white/55">
            This event is a simplified mission simulation. The crew must balance limited supplies, equipment, and safety rather than waiting for a perfect option.
            {event.nasaTag ? ` Related concept: ${event.nasaTag}.` : ""}
          </p>
        </details>

        {selectedChoice && (
          <p className="mt-2 rounded-lg bg-cyan-400/5 px-3 py-2 text-[9px] leading-relaxed text-white/60">
            NOVA asks: {selectedChoice.novaHint}
          </p>
        )}

        <button
          type="button"
          disabled={!selectedChoice}
          onClick={() => {
            if (selectedChoice) resolveEventChoice(selectedChoice);
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-[#071426] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/35 disabled:text-[#071426]/60"
        >
          Confirm Decision <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-2 text-center text-[8px] text-white/35">
          There is no free choice. Compare what each strategy protects and what it costs.
        </p>
      </motion.div>
      </div>
    </div>
  );
}
