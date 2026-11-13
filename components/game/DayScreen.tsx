"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CloudSun, Radio, Sparkles } from "lucide-react";
import { RESOURCE_META, RESOURCE_ORDER } from "@/lib/game/constants";
import { dayLabel } from "@/lib/game/engine";
import { upcomingSpaceWeather } from "@/lib/game/spaceWeather";
import { useGameStore } from "@/lib/game/store";
import { NovaBot, SamiAvatar } from "./Characters";
import { MeterBar, meterStatus } from "./MeterBar";
import { MissionTopBar } from "./MissionTopBar";
import { OutpostScene } from "./OutpostScene";

function crewStatus(values: number[]) {
  const lowest = Math.min(...values);
  if (lowest <= 0) return { title: "Emergency!", detail: "A meter is empty. The crew needs your help now.", tone: "critical" as const };
  if (lowest < 25) return { title: "Crew is worried", detail: "Life support is running low. Fix it today if you can.", tone: "critical" as const };
  if (lowest < 45) return { title: "Needs attention", detail: "The crew is healthy, but one system is getting weak.", tone: "warn" as const };
  return { title: "All Safe", detail: "Your crew is healthy and ready for today's mission.", tone: "ok" as const };
}

export function DayScreen() {
  const playerName = useGameStore((s) => s.playerName);
  const baseName = useGameStore((s) => s.baseName);
  const planet = useGameStore((s) => s.planet);
  const day = useGameStore((s) => s.day);
  const missionLength = useGameStore((s) => s.missionLength);
  const resources = useGameStore((s) => s.resources);
  const decisions = useGameStore((s) => s.decisions);
  const lastResult = useGameStore((s) => s.lastResult);
  const spaceWeather = useGameStore((s) => s.spaceWeather);
  const startBriefing = useGameStore((s) => s.startBriefing);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const status = crewStatus(RESOURCE_ORDER.map((key) => resources[key]));
  const watch = upcomingSpaceWeather(day, spaceWeather, missionLength);
  const lastDecision = decisions[decisions.length - 1];
  const isLastDay = day >= missionLength;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,132,255,0.18),transparent_32%),linear-gradient(180deg,#071426_0%,#091c31_35%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <MissionTopBar showMeters={false} />

        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-4">
            <motion.section
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[26px] border border-cyan-300/20 bg-[#0B1B33]/90 p-5 sm:p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                {dayLabel(planet, day)} · {baseName}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
                Good morning, Captain {playerName.trim() || "Nova"}!
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/60">
                {isLastDay
                  ? "The last day of the mission. Let's finish carefully."
                  : `Let's check how our base is doing today.`}
              </p>

              <div className="mt-4">
                <MeterBar />
              </div>
            </motion.section>

            <OutpostScene />
          </div>

          <div className="space-y-4">
            <section
              className={`rounded-[26px] border p-4 ${
                status.tone === "critical"
                  ? "border-rose-400/40 bg-rose-500/10"
                  : status.tone === "warn"
                    ? "border-amber-300/40 bg-amber-400/10"
                    : "border-emerald-300/30 bg-emerald-400/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <SamiAvatar size="sm" mood={status.tone === "ok" ? "cheering" : status.tone === "warn" ? "focused" : "worried"} />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                    Crew status
                  </p>
                  <p className="text-lg font-black leading-tight">{status.title}</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-white/70">{status.detail}</p>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-4">
              <div className="mb-2 flex items-center gap-2">
                <NovaBot size="sm" speaking />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">NOVA</p>
                  <p className="text-sm font-black">Decision Coach</p>
                </div>
              </div>
              <p className="rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-3 text-sm font-semibold leading-relaxed text-white/85">
                Everything looks steady, Captain. Let&apos;s see what today brings — and remember, every meter
                matters.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-white/45">
                <Sparkles className="h-3 w-3 text-cyan-300" aria-hidden />
                Trade-offs are the lesson.
              </div>
            </section>

            {watch && (
              <section className="rounded-[26px] border border-amber-300/30 bg-amber-400/10 p-4">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-amber-300" aria-hidden />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
                    Space weather
                  </p>
                </div>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-50/90">{watch.message}</p>
              </section>
            )}

            {lastDecision && (
              <section className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-300" aria-hidden />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                    Yesterday&apos;s decision
                  </p>
                </div>
                <p className="mt-1 text-sm font-black">{lastDecision.choiceLabel}</p>
                <p className="text-[11px] font-semibold text-white/50">{lastDecision.eventTitle}</p>
                {lastResult && lastResult.day === lastDecision.day && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {RESOURCE_ORDER.map((key) => {
                      const delta = lastResult.after[key] - lastResult.before[key];
                      return (
                        <span
                          key={key}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            delta < 0 ? "bg-rose-400/15 text-rose-200" : "bg-emerald-400/15 text-emerald-200"
                          }`}
                        >
                          {RESOURCE_META[key].label} {delta > 0 ? `+${delta}` : delta}
                        </span>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            <div className="rounded-[26px] border border-white/10 bg-[#0B1B33]/90 p-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                <span>Base check</span>
                <span>
                  {RESOURCE_ORDER.filter((key) => meterStatus(resources[key]).tone === "ok").length}/3 systems healthy
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-white/60">
                Low meters are easier to fix before they reach zero. Read the briefing, then choose your plan.
              </p>
            </div>

            <motion.button
              type="button"
              whileTap={reduced ? undefined : { scale: 0.98 }}
              onClick={startBriefing}
              className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#F5C542] px-5 py-4 text-base font-black text-[#071426] shadow-[0_0_26px_rgba(245,197,66,0.35)] transition hover:bg-[#ffd75e]"
            >
              {isLastDay ? "Start the Final Briefing" : "Start Today's Briefing"}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </motion.button>

            <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-white/35">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              The meters are simplified game values, not real mission measurements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
