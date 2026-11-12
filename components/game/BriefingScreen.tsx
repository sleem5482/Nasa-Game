"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import type { Difficulty, Planet } from "@/lib/game/types";

function Scene({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[160px] sm:h-[190px] overflow-hidden rounded-[18px] bg-[#05070c]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 480px, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function MoonScene() {
  return <Scene src="/images/moon.png" alt="Lunar outpost" />;
}

function MarsScene() {
  return <Scene src="/images/mars.png" alt="Martian outpost" />;
}

function DestinationCard({
  planet,
  selected,
  onSelect,
  eyebrow,
  title,
  description,
  tags,
}: {
  planet: Planet;
  selected: boolean;
  onSelect: () => void;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative text-left rounded-[22px] border-2 overflow-hidden transition bg-[#121a28] ${
        selected
          ? "border-[#4AF2FF] shadow-[0_0_0_1px_rgba(74,242,255,0.35),0_12px_40px_rgba(74,242,255,0.12)]"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <span
        className={`absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-[#4AF2FF] bg-[#4AF2FF] text-[#071426]"
            : "border-white/35 bg-transparent text-transparent"
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>

      <div className="p-3 pb-0">{planet === "moon" ? <MoonScene /> : <MarsScene />}</div>

      <div className="p-4 sm:p-5 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45 mb-1">
          {eyebrow}
        </p>
        <h3 className="text-white font-black text-xl sm:text-2xl leading-tight mb-2">
          {title}
        </h3>
        <p className="text-white/65 text-sm leading-relaxed mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs font-bold border ${
                selected
                  ? "bg-[#4AF2FF]/10 border-[#4AF2FF]/35 text-[#9aefff]"
                  : "bg-white/5 border-white/10 text-white/60"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "normal", label: "Normal" },
  { id: "expert", label: "Expert" },
];

export function BriefingScreen() {
  const planet = useGameStore((s) => s.planet);
  const difficulty = useGameStore((s) => s.difficulty);
  const selectPlanet = useGameStore((s) => s.selectPlanet);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const startMission = useGameStore((s) => s.startMission);
  const setScreen = useGameStore((s) => s.setScreen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  return (
    <div
      className="min-h-screen bg-[#0B121E] text-white px-4 py-5 sm:px-8 sm:py-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(11,18,30,.86), rgba(11,18,30,.94)), url(/images/bg-space.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-5xl flex flex-col min-h-[calc(100vh-2.5rem)]">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-8 sm:mb-10">
          <button
            type="button"
            onClick={() => setScreen("title")}
            className="justify-self-start inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold text-white/75 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Image
            src="/images/logo.png"
            alt="Solbound"
            width={677}
            height={369}
            className="h-12 w-auto sm:h-14"
          />

          <p className="justify-self-end text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            Mission Setup · 01
          </p>
        </header>

        <div className="mb-6 sm:mb-8 max-w-3xl">
          <h1 className="font-black text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.1] tracking-tight mb-3">
            Two worlds. Two different missions.
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed">
            The scenery is not the only thing that changes. Each world has its own
            engineering problems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mb-8 flex-1">
          <DestinationCard
            planet="moon"
            selected={planet === "moon"}
            onSelect={() => selectPlanet("moon")}
            eyebrow="Lunar Outpost"
            title="Build a home on the Moon."
            description="Master long shadows, sharp dust, water-ice extraction and intense radiation with Earth hanging in the black sky."
            tags={["Long shadows", "Water ice", "Lunar dust", "1.3 s delay"]}
          />
          <DestinationCard
            planet="mars"
            selected={planet === "mars"}
            onSelect={() => selectPlanet("mars")}
            eyebrow="Martian Outpost"
            title="Build a future on the Red Planet."
            description="Grow food and protect power through cold nights, rust-red dust storms and long communication delays."
            tags={["Dust storms", "Thin CO₂ air", "Food cycles", "3–22 min delay"]}
          />
        </div>

        <footer className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-2 pb-1">
          <div>
            <p className="text-sm font-black text-white mb-1">Simulation Difficulty</p>
            <p className="text-xs text-white/50 mb-3 max-w-xs">
              Changes starting supplies, daily use and event pressure.
            </p>
            <div
              className="inline-flex rounded-full border border-white/15 bg-[#121a28] p-1"
              role="group"
              aria-label="Simulation difficulty"
            >
              {DIFFICULTIES.map((item) => {
                const active = difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-[#4AF2FF] text-[#071426] shadow-[0_0_16px_rgba(74,242,255,0.35)]"
                        : "text-white/65 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button
            type="button"
            disabled={!planet}
            whileTap={reduced || !planet ? undefined : { scale: 0.98 }}
            onClick={startMission}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[18px] px-7 py-3.5 font-black text-base ${
              planet
                ? "bg-[#4AF2FF] text-[#071426] shadow-[0_0_28px_rgba(74,242,255,0.35)]"
                : "bg-white/10 text-white/35 cursor-not-allowed"
            }`}
          >
            Confirm Mission
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </footer>
      </div>
    </div>
  );
}
