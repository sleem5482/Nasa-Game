"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isMarsDustDay } from "@/lib/game/constants";
import {
  ArrowLeft,
  Apple,
  Droplets,
  History,
  MessageSquare,
  Radio,
  Rocket,
  Shield,
  Sparkles,
  Wind,
  Zap,
  Activity,
  Thermometer,
} from "lucide-react";
import { RESOURCE_META } from "@/lib/game/constants";
import { getWeakestResource } from "@/lib/game/dayLogic";
import { CREW_ACTIONS_PER_DAY } from "@/lib/game/moduleActions";
import { useGameStore } from "@/lib/game/store";
import type { ResourceKey } from "@/lib/game/types";

const METERS: {
  label: string;
  value: (resources: ReturnType<typeof useGameStore.getState>["resources"]) => number;
  color: string;
  icon: typeof Zap;
  suffix?: string;
}[] = [
  { label: "Energy", value: (resources) => resources.energy, color: "#36D6F5", icon: Zap, suffix: "%" },
  { label: "Water", value: (resources) => resources.water, color: "#36D6F5", icon: Droplets, suffix: "%" },
  { label: "Oxygen", value: (resources) => resources.oxygen, color: "#36D6F5", icon: Wind, suffix: "%" },
  { label: "Food", value: (resources) => resources.food, color: "#36D6F5", icon: Apple, suffix: "%" },
  { label: "Crew safety", value: (resources) => resources.shielding, color: "#36D6F5", icon: Shield, suffix: "%" },
  { label: "Radiation exposure", value: (resources) => 100 - resources.shielding, color: "#F5A742", icon: Activity, suffix: "%" },
];

type Message = {
  id: number;
  sender: "crew" | "earth";
  text: string;
  pending?: boolean;
};

function historyPath(
  history: ReturnType<typeof useGameStore.getState>["history"],
  key: "energy" | "water" | "oxygen",
): string {
  if (history.length === 1) return "M 10 70 L 290 70";
  return history
    .map((snapshot, index) => {
      const x = 10 + (index / (history.length - 1)) * 280;
      const y = 110 - (snapshot[key] / 100) * 90;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function earthReply(resources: ReturnType<typeof useGameStore.getState>["resources"]): string {
  const weakest = getWeakestResource(resources);
  const advice: Record<Exclude<ResourceKey, "science">, string> = {
    energy: "Energy is your lowest reserve. Check your solar generation and battery use before committing power to optional systems.",
    water: "Water is your lowest reserve. Prioritize recycling and make sure the greenhouse plan is sustainable.",
    oxygen: "Oxygen is your lowest reserve. Keep life support powered before spending on research.",
    food: "Food is your lowest reserve. Consider a greenhouse action, while keeping enough water for the crew.",
    shielding: "Crew shielding is your lowest reserve. Review shelter protection and be ready for radiation events.",
  };
  const guidance =
    weakest === "science"
      ? "Your life-support systems look balanced. Consider whether a research action is worth its energy cost."
      : advice[weakest];
  return `Mission Control received your transmission. ${guidance}`;
}

function ResourceMeter({
  label,
  value,
  color,
  icon: Icon,
  suffix = "%",
}: {
  label: string;
  value: number;
  color: string;
  icon: typeof Zap;
  suffix?: string;
}) {
  const reduced = useGameStore((state) => state.accessibility.reducedMotion);
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A192B] p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-white/55">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          {label}
        </span>
        <span className="text-[10px] font-black text-white">{value}{suffix}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

export function MissionControl() {
  const day = useGameStore((state) => state.day);
  const planet = useGameStore((state) => state.planet);
  const resources = useGameStore((state) => state.resources);
  const history = useGameStore((state) => state.history);
  const dayLogs = useGameStore((state) => state.dayLogs);
  const modules = useGameStore((state) => state.modules);
  const missionActivity = useGameStore((state) => state.missionActivity);
  const crewActionsRemaining = useGameStore((state) => state.crewActionsRemaining);
  const toggleMissionControl = useGameStore((state) => state.toggleMissionControl);
  const reduced = useGameStore((state) => state.accessibility.reducedMotion);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  const remainingLabel = `${crewActionsRemaining}/${CREW_ACTIONS_PER_DAY} crew actions`;
  const activities = missionActivity.filter((activity) => activity.day === day).slice(-3);
  const memories = [
    ...missionActivity.map((activity) => ({
      id: activity.id,
      day: activity.day,
      title: activity.title,
      detail: activity.detail,
    })),
    ...dayLogs.map((entry, index) => ({
      id: `log-${entry.day}-${index}`,
      day: entry.day,
      title: entry.eventTitle ?? `${planet === "mars" ? "Sol" : "Day"} completed`,
      detail: entry.choiceLabel
        ? `Crew chose: ${entry.choiceLabel}`
        : `${entry.weakestResource} was the lowest system`,
    })),
  ].slice(-4).reverse();

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "crew", text },
      { id: Date.now() + 1, sender: "earth", text: "Transmission sent. Waiting for Earth’s reply…", pending: true },
    ]);
    setDraft("");
    setSending(true);

    replyTimer.current = setTimeout(() => {
      setMessages((current) => [
        ...current.filter((message) => !message.pending),
        { id: Date.now(), sender: "earth", text: earthReply(resources) },
      ]);
      setSending(false);
    }, planet === "mars" ? 2800 : 1300);
  }

  return (
    <main className="min-h-screen bg-[#071426] px-3 py-5 text-white sm:px-6 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleMissionControl(false)}
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" /> Outpost
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400 text-[#071426]">
              <Rocket className="h-4 w-4" />
            </span>
            <span className="text-xs font-black tracking-[0.16em]">SOLBOUND</span>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Mission time</div>
            <div className="text-xs font-black text-white">{planet === "mars" ? "SOL" : "DAY"} {day} · {String(8 + (day * 3) % 12).padStart(2, "0")}:32</div>
          </div>
        </header>

        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="space-y-3">
            <motion.section
              className="relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-[#142e4a] to-[#10243d] p-5 sm:p-6"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Mission Control</p>
                <h1 className="mt-1 text-2xl font-black">SOLBOUND-01</h1>
                <p className="mt-1 text-xs text-white/55">
                  {planet === "mars" ? "Martian Outpost" : "Lunar South Pole"} · Crew status:{" "}
                  <span className="font-black text-cyan-300">
                    {modules.every((module) => module.status === "online") ? "OPERATIONAL" : "ATTENTION"}
                  </span>
                </p>
              </div>
              <motion.div
                className="absolute -right-2 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_30%_30%,#e0fbff,#79c9e6_38%,#24629a_70%,#10243d)] shadow-[0_0_38px_rgba(80,185,240,.3)] sm:h-36 sm:w-36"
                animate={reduced ? undefined : { y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.section>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {METERS.map((meter) => (
                <ResourceMeter
                  key={meter.label}
                  label={meter.label}
                  value={meter.value(resources)}
                  color={meter.color}
                  icon={meter.icon}
                />
              ))}
            </section>

            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">System analytics</p>
                    <h2 className="text-sm font-black">Resource history</h2>
                  </div>
                </div>
                <svg viewBox="0 0 300 130" className="h-32 w-full" role="img" aria-label="Energy, water, and oxygen history">
                  <path d="M 10 110 H 290 M 10 65 H 290 M 10 20 H 290" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
                  <path d={historyPath(history, "energy")} fill="none" stroke="#F5C542" strokeWidth="2" />
                  <path d={historyPath(history, "water")} fill="none" stroke="#36D6F5" strokeWidth="2" />
                  <path d={historyPath(history, "oxygen")} fill="none" stroke="#83B8FF" strokeWidth="2" />
                </svg>
                <div className="flex justify-center gap-4 text-[9px] font-bold">
                  <span className="text-amber-300">● Energy</span>
                  <span className="text-cyan-300">● Water</span>
                  <span className="text-blue-300">● Oxygen</span>
                </div>
              </section>

              <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Environment</p>
                    <h2 className="text-sm font-black">Surface conditions</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Temperature", planet === "mars" ? "-63°C" : "-173°C"],
                    ["Solar", planet === "mars" && isMarsDustDay(day) ? "Dusty skies" : "Low angle"],
                    ["Radiation risk", resources.shielding < 40 ? "High" : "Elevated"],
                    ["Equipment", `${modules.filter((module) => module.status === "online").length} / ${modules.length} nominal`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#071426] p-2.5">
                      <p className="text-[8px] font-bold text-white/40">{label}</p>
                      <p className="mt-1 text-[10px] font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Mission activity · {remainingLabel}</p>
                    <h2 className="text-sm font-black">Today&apos;s operations</h2>
                  </div>
                </div>
                {activities.length > 0 ? (
                  <ul className="space-y-2">
                    {activities.map((activity) => (
                      <li key={activity.id} className="flex items-start gap-2 rounded-xl bg-[#071426] p-2.5">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                        <span>
                          <span className="block text-[10px] font-black">{activity.title}</span>
                          <span className="mt-0.5 block text-[8px] text-white/40">{activity.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl bg-[#071426] p-3 text-[10px] text-white/50">
                    No crew actions used today. Choose a module action to begin.
                  </div>
                )}
              </section>

              <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-cyan-300" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">Event log</p>
                    <h2 className="text-sm font-black">Recent mission memory</h2>
                  </div>
                </div>
                {memories.length ? (
                  <ul className="space-y-1.5">
                    {memories.map((memory) => (
                      <li key={memory.id} className="flex gap-2 rounded-xl bg-[#071426] px-2.5 py-2">
                        <span className="text-[9px] font-black text-cyan-300">{String(memory.day).padStart(2, "0")}</span>
                        <span>
                          <span className="block text-[9px] font-black">{memory.title}</span>
                          <span className="block text-[8px] text-white/40">{memory.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl bg-[#071426] p-3 text-[10px] text-white/50">Mission records will appear here as your crew makes decisions.</p>
                )}
              </section>
            </div>
          </div>

          <aside className="space-y-3">
            <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black">Message Earth</h2>
                <Radio className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mb-3 text-[9px] leading-relaxed text-white/50">
                Ask for advice. Your mission continues while the reply travels through space.
              </p>
              <div className="mb-3 max-h-52 space-y-2 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="rounded-xl bg-[#071426] p-3 text-xs leading-relaxed text-white/80">
                    Mission Control, please review our power plan.
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`rounded-xl p-3 text-[10px] leading-relaxed ${
                          message.sender === "crew"
                            ? "ml-5 bg-cyan-400/10 text-cyan-100"
                            : "mr-3 bg-[#071426] text-white/75"
                        }`}
                        initial={reduced ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {message.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              <form onSubmit={sendMessage} className="space-y-2">
                <label htmlFor="earth-message" className="sr-only">Message Earth</label>
                <textarea
                  id="earth-message"
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message to Earth…"
                  className="w-full resize-none rounded-xl border border-white/5 bg-[#071426] p-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2.5 text-xs font-black text-[#071426] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  {sending ? "Message in transit…" : "Send message"}
                </button>
              </form>
            </section>

            <section className="rounded-[22px] border border-white/10 bg-[#10243D] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-black">Why autonomy matters</h2>
              </div>
              <p className="text-[10px] leading-relaxed text-white/55">
                {planet === "mars"
                  ? "Mars is far from Earth. Replies take longer, so crews train with emergency procedures and practice careful decisions on their own."
                  : "The Moon is close to Earth, but messages still take time. Crews practice careful decisions and keep the outpost safe while they wait."}
              </p>
            </section>

            <section className="rounded-[22px] border border-cyan-300/15 bg-[#10243D] p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg">🤖</div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-cyan-300">NOVA · Decision Coach</p>
                  <p className="text-xs font-black">Your mission data shows what changed.</p>
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-white/70">
                Your lowest system is {RESOURCE_META[getWeakestResource(resources)].label}. Ask why it changed before choosing your next action.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
