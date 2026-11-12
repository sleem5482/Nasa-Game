"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  Check,
  Rocket,
  Settings,
} from "lucide-react";
import { useGameStore } from "@/lib/game/store";

const NOVA_TEXT =
  "Welcome aboard. Our space colony is facing a critical resource shortage. We have only 30 days to save the mission. Are you ready?";

// أرقام للديكور بس (شاشة البداية)
const STATS = [
  { label: "Oxygen", value: 18, icon: "/images/icon-oxygen.png", color: "text-rose-400" },
  { label: "Water", value: 32, icon: "/images/icon-water.png", color: "text-orange-300" },
  { label: "Food", value: 41, icon: "/images/icon-food.png", color: "text-yellow-300" },
  { label: "Energy", value: 12, icon: "/images/icon-energy.png", color: "text-rose-400" },
];

function useTypewriter(text: string, instant: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (instant) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [text, instant]);
  return instant ? text : text.slice(0, count);
}

function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(critical resource shortage|30 days)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "critical resource shortage" || part === "30 days" ? (
          <b key={i} className="text-yellow-300">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function TitleScreen() {
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setScreen = useGameStore((s) => s.setScreen);
  const selectPlanet = useGameStore((s) => s.selectPlanet);
  const toggleLargeText = useGameStore((s) => s.toggleLargeText);
  const toggleReducedMotion = useGameStore((s) => s.toggleReducedMotion);
  const toggleScienceLibrary = useGameStore((s) => s.toggleScienceLibrary);
  const accessibility = useGameStore((s) => s.accessibility);
  const reduced = accessibility.reducedMotion;

  const typed = useTypewriter(NOVA_TEXT, reduced);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#071426] text-white"
      style={{
        backgroundImage: "url(/images/bg-cockpit.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030619]/40 via-[#030619]/10 to-[#030619]/60" />

      {/* الكراكتر */}
      <Image
        src="/images/astronaut-point.png"
        alt="Astronaut"
        width={408}
        height={612}
        priority
        className="pointer-events-none absolute bottom-0 left-0 z-[5] h-[26vh] w-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] sm:h-[34vh] lg:left-[2vw] lg:h-[72vh]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <Image
            src="/images/logo.png"
            alt="Solbound"
            width={677}
            height={369}
            priority
            className="h-14 w-auto sm:h-16"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleScienceLibrary(true)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#4aa8ff] bg-[#0d2a5c]/90 px-4 py-2 text-sm font-bold text-white hover:bg-[#12397a]"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Science Library</span>
            </button>
            <button
              type="button"
              aria-label="Settings"
              onClick={() => toggleScienceLibrary(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#4aa8ff] bg-[#0d2a5c]/90 hover:bg-[#12397a]"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-5 py-6 lg:pl-[24%]">
          {/* Resource Alert */}
          <motion.section
            className="w-full max-w-2xl rounded-[20px] border-[3px] border-rose-500 bg-[#28081e]/85 p-4"
            animate={
              reduced
                ? undefined
                : {
                    boxShadow: [
                      "0 0 24px rgba(255,60,60,0.45)",
                      "0 0 44px rgba(255,60,60,0.85)",
                      "0 0 24px rgba(255,60,60,0.45)",
                    ],
                  }
            }
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <h2 className="mb-3 text-center text-xl font-black tracking-wide text-rose-400">
              ⚠ RESOURCE ALERT
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <Image src={s.icon} alt="" width={40} height={40} className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
                  <strong className={`text-xl font-black sm:text-2xl ${s.color}`}>{s.value}%</strong>
                  <small className="text-xs text-white/80">{s.label}</small>
                </div>
              ))}
            </div>
          </motion.section>

          {/* NOVA */}
          <section className="w-full max-w-2xl rounded-[20px] border-[3px] border-[#4aa8ff] bg-[#08143c]/92 p-4">
            <header className="mb-2 flex items-center gap-2 font-bold text-[#7fd0ff]">
              <Image src="/images/nova.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
              <span>Mission Guide - NOVA</span>
            </header>
            <p className="min-h-[5.5em] leading-relaxed">
              <b>Hey, {playerName.trim() || "Commander"}!</b>
              <br />
              <Highlighted text={typed} />
            </p>
          </section>

          <label className="w-full max-w-sm text-sm font-bold text-white/85">
            Your name
            <input
              type="text"
              maxLength={24}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Enter your name"
              className="mt-2 w-full rounded-xl border-2 border-[#4aa8ff]/70 bg-[#08143c]/90 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <motion.button
            type="button"
            whileTap={reduced ? undefined : { scale: 0.97 }}
            onClick={() => {
              selectPlanet("moon");
              setScreen("briefing");
            }}
            className="inline-flex items-center gap-2 rounded-2xl border-[3px] border-yellow-100 bg-gradient-to-b from-[#ffd23d] to-[#f5a300] px-9 py-4 text-lg font-black text-[#2a1a00] shadow-[0_0_26px_rgba(255,200,40,0.6)]"
          >
            START MISSION
            <Rocket className="h-5 w-5" />
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </main>

        <footer className="flex flex-wrap items-end justify-end gap-3 pb-2">
          <button
            type="button"
            onClick={toggleLargeText}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
              accessibility.largeText
                ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                : "border-white/15 bg-[#0B1B33]/80 text-white/80"
            }`}
          >
            <Accessibility className="h-4 w-4" />
            Large text
          </button>
          <button
            type="button"
            onClick={toggleReducedMotion}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
              accessibility.reducedMotion
                ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                : "border-white/15 bg-[#0B1B33]/80 text-white/80"
            }`}
          >
            <Check className="h-4 w-4" />
            Reduced motion
          </button>
          <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#0B1B33]/85 px-4 py-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                Mission Status
              </div>
              <div className="flex items-center gap-2 font-bold">
                Ready for launch
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
