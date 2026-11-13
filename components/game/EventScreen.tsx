"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AlertTriangle, Compass, Info, Sparkles } from "lucide-react";
import { crewDisplayName } from "@/lib/game/events";
import { dayLabel } from "@/lib/game/engine";
import { useGameStore } from "@/lib/game/store";
import { CrewPortrait, NovaBot, SamiAvatar } from "./Characters";
import { MissionTopBar } from "./MissionTopBar";
import { SourceTag } from "./SourceTag";

const EVENT_IMAGES: Record<string, string> = {
  "dust-storm": "/images/event-dust.jpg",
  "lunar-night": "/images/event-night.jpg",
  "solar-flare": "/images/event-flare.jpg",
  "filter-glitch": "/images/event-equipment.jpg",
  "greenhouse-wilt": "/images/interior-greenhouse.jpg",
  "water-recycler": "/images/interior-habitat.jpg",
  "ice-discovery": "/images/event-night.jpg",
  "dust-seal": "/images/event-dust.jpg",
  "comms-delay": "/images/event-night.jpg",
  "equipment-damage": "/images/event-equipment.jpg",
  "quiet-day": "/images/interior-lab.jpg",
  "final-check": "/images/bg-cockpit.png",
};

const KIND = {
  warning: {
    label: "Mission alert",
    word: "Warning",
    icon: AlertTriangle,
    badge: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  },
  opportunity: {
    label: "Mission alert",
    word: "Opportunity",
    icon: Compass,
    badge: "border-emerald-300/40 bg-emerald-400/15 text-emerald-200",
  },
  info: {
    label: "Mission update",
    word: "Notice",
    icon: Info,
    badge: "border-cyan-300/40 bg-cyan-400/15 text-cyan-200",
  },
} as const;

export function EventScreen() {
  const event = useGameStore((s) => s.activeEvent);
  const planet = useGameStore((s) => s.planet);
  const day = useGameStore((s) => s.day);
  const openDecision = useGameStore((s) => s.openDecision);
  const setScreen = useGameStore((s) => s.setScreen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  if (!event) return null;
  const kind = KIND[event.kind];
  const KindIcon = kind.icon;
  const image = EVENT_IMAGES[event.imageKey ?? event.id] ?? "/images/event-flare.jpg";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_35%_50%,rgba(62,115,148,.32),transparent_46%),linear-gradient(115deg,#08192b,#071426_60%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <MissionTopBar />

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative hidden min-h-[520px] overflow-hidden rounded-[26px] border border-white/10 shadow-2xl lg:block">
            <Image
              src={image}
              alt={event.title}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b14]/85 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                {dayLabel(planet, day)} · {crewDisplayName(event.crew)}
              </p>
              <p className="mt-1 text-2xl font-black leading-tight drop-shadow">{event.title}</p>
            </div>
          </div>

          <motion.section
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="rounded-[26px] border border-cyan-300/15 bg-[#0B1B33]/95 p-4 shadow-2xl sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${kind.badge}`}>
                <KindIcon className="h-3.5 w-3.5" aria-hidden />
                {kind.label}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                {kind.word}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{event.title}</h1>

            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-orange-300/15 bg-orange-300/5 p-3">
              <NovaBot size="sm" speaking mood={event.kind === "warning" ? "worried" : "happy"} />
              <p className="pt-1 text-sm font-semibold leading-relaxed text-orange-50/90">
                {event.story}
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-[#071426] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                What could happen?
              </p>
              <ul className="mt-2 space-y-1.5">
                {event.impacts.map((impact) => (
                  <li key={impact} className="flex items-start gap-2 text-xs font-semibold text-white/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    {impact}
                  </li>
                ))}
              </ul>
            </div>

            {event.source && (
              <div className="mt-3 space-y-1.5 rounded-2xl border border-cyan-300/15 bg-cyan-400/5 p-3">
                <SourceTag source={event.source} />
                {event.realFact && (
                  <p className="text-[11px] leading-relaxed text-cyan-50/80">{event.realFact}</p>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <div className="shrink-0">
                <SamiAvatar size="sm" mood="focused" />
              </div>
              <p className="text-xs font-semibold leading-relaxed text-white/55">
                Captain, nothing is decided yet. Read the warning, then choose what to do.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setScreen("day")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black text-white/70 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to base
              </button>
              <motion.button
                type="button"
                whileTap={reduced ? undefined : { scale: 0.98 }}
                onClick={openDecision}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#071426] transition hover:bg-cyan-300"
              >
                What should we do, Captain?
                <ArrowRight className="h-4 w-4" aria-hidden />
              </motion.button>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-white/30">
              <Sparkles className="h-3 w-3" aria-hidden />
              Real NASA space-weather data can change today&apos;s warning.
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
