"use client";

import { BookOpenText, ShieldAlert, Sparkles } from "lucide-react";
import { NovaBot, SamiAvatar } from "./Characters";
import { ModuleInterior } from "./ModuleInterior";
import { OutpostView } from "./OutpostView";
import { PowerAllocator } from "./PowerAllocator";
import { ResourceBar } from "./ResourceBar";
import { MissionControl } from "./MissionControl";
import { useGameStore } from "@/lib/game/store";
import { CREW_ACTIONS_PER_DAY } from "@/lib/game/moduleActions";

export function Dashboard() {
  const playerName = useGameStore((s) => s.playerName);
  const alerts = useGameStore((s) => s.alerts);
  const novaTip = useGameStore((s) => s.novaTip);
  const dayLogs = useGameStore((s) => s.dayLogs);
  const openDailyLogReview = useGameStore((s) => s.openDailyLogReview);
  const showModuleId = useGameStore((s) => s.showModuleId);
  const showMissionControl = useGameStore((s) => s.showMissionControl);
  const crewActionsRemaining = useGameStore((s) => s.crewActionsRemaining);

  if (showMissionControl) return <MissionControl />;
  if (showModuleId) return <ModuleInterior />;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,132,255,0.18),transparent_30%),linear-gradient(180deg,#071426_0%,#091c31_35%,#081a2e_100%)] px-3 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <ResourceBar />

        <div className="grid items-start gap-4 lg:grid-cols-[0.82fr_1.5fr_0.85fr]">
          <aside className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-4 shadow-[0_10px_30px_rgba(10,18,32,0.7)]">
              <div className="mb-3 flex items-center gap-3">
                <SamiAvatar size="md" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Crew Lead</p>
                  <p className="text-lg font-black">{playerName.trim() || "Commander"}</p>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Alert Center</h3>
                <span className="rounded-full bg-orange-400/20 px-2 py-0.5 text-[10px] font-black text-orange-200">{alerts.length}</span>
              </div>

              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                      alert.tone === "critical"
                        ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
                        : alert.tone === "warn"
                          ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                          : "border-cyan-400/30 bg-cyan-500/10 text-cyan-50"
                    }`}
                  >
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-3 shadow-[0_10px_30px_rgba(10,18,32,0.7)]">
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Mission Navigation</div>
              <nav className="space-y-2 text-sm font-semibold text-white/75">
                {[
                  "Technology Tree",
                  "Mission History",
                  "Science Library",
                  "Classroom Mode",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-3 py-2 text-left hover:bg-white/5"
                  >
                    <span>{item}</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-300/70" />
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="space-y-4">
            <OutpostView />
            <PowerAllocator />
          </section>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-4 shadow-[0_10px_30px_rgba(10,18,32,0.7)]">
              <div className="mb-3 flex items-center gap-3">
                <NovaBot speaking size="md" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">NOVA</p>
                  <p className="text-lg font-black">Decision Coach</p>
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-3 text-sm font-medium leading-relaxed text-white/85">
                {novaTip}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Trade-offs are the lesson.
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-4 shadow-[0_10px_30px_rgba(10,18,32,0.7)]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Today&apos;s operations</span>
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black text-cyan-200">{crewActionsRemaining}/{CREW_ACTIONS_PER_DAY} left</span>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-300" style={{ width: `${(crewActionsRemaining / CREW_ACTIONS_PER_DAY) * 100}%` }} />
              </div>
              <p className="text-sm text-white/70">Every building action uses crew attention, even when its resource cost is small.</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0B1B33]/90 p-4 shadow-[0_10px_30px_rgba(10,18,32,0.7)]">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Latest result</span>
              </div>
              <p className="text-sm font-semibold text-white/80">Mission launched. The first systems check is complete.</p>
              <button type="button" onClick={openDailyLogReview} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">
                View timeline <span aria-hidden>→</span>
              </button>
            </div>

            <button
              type="button"
              disabled={dayLogs.length === 0}
              onClick={openDailyLogReview}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-[24px] px-4 py-4 text-base font-black ${
                dayLogs.length === 0
                  ? "cursor-not-allowed bg-yellow-500/20 text-yellow-200/50"
                  : "bg-[#F5C542] text-[#071426] shadow-[0_0_24px_rgba(245,197,66,0.35)]"
              }`}
            >
              <BookOpenText className="h-5 w-5" />
              Daily Log
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
