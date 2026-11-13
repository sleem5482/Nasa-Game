"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { RESOURCE_META, isMarsDustDay } from "@/lib/game/constants";
import { formatDelta } from "@/lib/game/dayLogic";
import { useGameStore } from "@/lib/game/store";
import type {
  CrewChoice,
  ModuleId,
  ResourceKey,
  Resources,
} from "@/lib/game/types";

type Effects = Partial<Resources>;
type SceneProps = { onResult: (message: string) => void };

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

type Flash = { id: number; effects: Effects; lesson: string };

function useCrewCommit(onResult: (message: string) => void) {
  const applyCrewChoice = useGameStore((s) => s.applyCrewChoice);
  const resources = useGameStore((s) => s.resources);
  const actionsLeft = useGameStore((s) => s.crewActionsRemaining);
  const [flash, setFlash] = useState<Flash | null>(null);

  function canAfford(effects: Effects) {
    return (Object.keys(effects) as ResourceKey[]).every(
      (key) => resources[key] + (effects[key] ?? 0) >= 0,
    );
  }

  function commit(choice: CrewChoice, lesson: string) {
    const ok = applyCrewChoice(choice);
    if (ok) {
      setFlash({ id: Date.now(), effects: choice.effects, lesson });
      onResult(`${choice.title}: ${formatDelta(choice.effects)}.`);
    } else {
      onResult("Not enough resources or crew actions for that choice.");
    }
    return ok;
  }

  return { actionsLeft, canAfford, commit, flash };
}

function EffectChips({ effects }: { effects: Effects }) {
  const keys = (Object.keys(effects) as ResourceKey[]).filter((k) => effects[k]);
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => {
        const v = effects[k] ?? 0;
        return (
          <span
            key={k}
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              v > 0 ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200"
            }`}
          >
            {v > 0 ? "+" : ""}
            {v} {RESOURCE_META[k].label}
          </span>
        );
      })}
    </div>
  );
}

function ScenePanel({
  title,
  hint,
  graphic,
  children,
  flash,
}: {
  title: string;
  hint: string;
  graphic: ReactNode;
  children: ReactNode;
  flash: Flash | null;
}) {
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  return (
    <div className="absolute inset-x-2 bottom-2 rounded-2xl border border-white/15 bg-[#071426]/85 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-24 shrink-0 sm:w-44">{graphic}</div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="text-sm font-black text-cyan-200">{title}</h3>
            <p className="text-[11px] leading-snug text-white/60">{hint}</p>
          </div>
          {children}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {flash && (
          <motion.div
            key={flash.id}
            className="mt-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-2"
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0 }}
          >
            <div className="mb-1 flex items-center gap-1 text-[11px] font-black text-emerald-200">
              <Check className="h-3.5 w-3.5" /> Result of your decision
            </div>
            <EffectChips effects={flash.effects} />
            <p className="mt-1 text-[10px] leading-snug text-white/70">{flash.lesson}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-black transition ${
            o.value === value
              ? "border-cyan-300 bg-cyan-400/25 text-cyan-100"
              : "border-white/10 bg-[#0d1d38] text-white/70 hover:border-cyan-300/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CommitButton({
  label,
  disabled,
  reason,
  onClick,
}: {
  label: string;
  disabled: boolean;
  reason?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-cyan-400 px-3 py-2 text-xs font-black text-[#071426] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {disabled && reason ? reason : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Habitat — oxygen generator (electrolysis)                          */
/* ------------------------------------------------------------------ */

const O2_LEVELS: { value: 1 | 2 | 3; label: string; effects: Effects }[] = [
  { value: 1, label: "Low", effects: { oxygen: 3, water: -1, energy: -1 } },
  { value: 2, label: "Medium", effects: { oxygen: 6, water: -2, energy: -3 } },
  { value: 3, label: "High", effects: { oxygen: 9, water: -4, energy: -6 } },
];

function HabitatScene({ onResult }: SceneProps) {
  const [level, setLevel] = useState<1 | 2 | 3>(2);
  const oxygen = useGameStore((s) => s.resources.oxygen);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const { actionsLeft, canAfford, commit, flash } = useCrewCommit(onResult);
  const choice = O2_LEVELS.find((l) => l.value === level)!;
  const fill = Math.max(2, Math.min(100, oxygen)) * 0.76;

  const graphic = (
    <svg viewBox="0 0 120 110" className="h-auto w-full" role="img" aria-label="Oxygen tank with bubbles">
      <defs>
        <clipPath id="o2-tank">
          <rect x="30" y="12" width="60" height="86" rx="14" />
        </clipPath>
      </defs>
      <rect x="30" y="12" width="60" height="86" rx="14" fill="#0d2a5c" stroke="#4aa8ff" strokeWidth="3" />
      <g clipPath="url(#o2-tank)">
        <rect x="30" y={96 - fill} width="60" height={fill + 4} fill="#36D6F5" opacity="0.55" />
        {Array.from({ length: level * 3 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={40 + ((i * 17) % 42)}
            cy={90}
            r={2 + (i % 3)}
            fill="#e0fbff"
            initial={false}
            animate={reduced ? undefined : { cy: [90, 22], opacity: [0.9, 0] }}
            transition={{ duration: 2.2 - level * 0.3, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </g>
      <rect x="50" y="4" width="20" height="10" rx="3" fill="#4aa8ff" />
      <text x="60" y="62" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff">
        O₂
      </text>
      <text x="60" y="106" textAnchor="middle" fontSize="9" fontWeight="800" fill="#9fdcff">
        {oxygen}% in the air
      </text>
    </svg>
  );

  return (
    <ScenePanel
      title="Oxygen generator"
      hint="Splits water into oxygen using electricity. Run it harder and it drinks more water and power."
      graphic={graphic}
      flash={flash}
    >
      <Segmented options={O2_LEVELS} value={level} onChange={setLevel} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/50">This run:</span>
        <EffectChips effects={choice.effects} />
      </div>
      <CommitButton
        label={`Run generator (${choice.label}) · 1 crew action`}
        disabled={actionsLeft <= 0 || !canAfford(choice.effects)}
        reason={actionsLeft <= 0 ? "No crew actions left" : "Not enough water or energy"}
        onClick={() =>
          commit(
            {
              id: `o2-${level}`,
              title: `Oxygen generator (${choice.label})`,
              effects: choice.effects,
              coachNote: "Making oxygen from water costs power. More oxygen now means less water and energy later.",
            },
            "Real stations make oxygen by electrolysis: electricity splits water into oxygen and hydrogen.",
          )
        }
      />
    </ScenePanel>
  );
}

/* ------------------------------------------------------------------ */
/* Power Station — aim the solar array                                */
/* ------------------------------------------------------------------ */

const SUN_BY_DAY = [35, 55, 70, 50, 30, 60, 45];

function PowerScene({ onResult }: SceneProps) {
  const day = useGameStore((s) => s.day);
  const planet = useGameStore((s) => s.planet);
  const [tilt, setTilt] = useState(45);
  const { actionsLeft, canAfford, commit, flash } = useCrewCommit(onResult);

  const sun = SUN_BY_DAY[(day - 1) % SUN_BY_DAY.length];
  const dusty = planet === "mars" && isMarsDustDay(day);
  const match = Math.max(0, 10 - Math.abs(tilt - sun) / 5);
  const gain = Math.max(0, Math.round(match) - (dusty ? 3 : 0));
  const effects: Effects = { energy: gain - 1 }; // -1 = motors that turn the array
  const rad = (sun * Math.PI) / 180;
  const sunX = 80 + 62 * Math.cos(rad);
  const sunY = 92 - 62 * Math.sin(rad);
  const tr = (tilt * Math.PI) / 180;
  const ray = { x: 80 + 40 * Math.cos(tr), y: 86 - 40 * Math.sin(tr) };

  const graphic = (
    <svg viewBox="0 0 160 100" className="h-auto w-full" role="img" aria-label="Solar panel aimed at the Sun">
      <path d="M18 92 A62 62 0 0 1 142 92" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeDasharray="3 4" />
      <line x1="10" y1="92" x2="150" y2="92" stroke="#c98b5a" strokeWidth="3" />
      <circle cx={sunX} cy={sunY} r="9" fill="#F5C542" />
      <line x1="80" y1="86" x2={ray.x} y2={ray.y} stroke="#7DDE6A" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="78" y="86" width="4" height="8" fill="#9aa7b8" />
      <g transform={`rotate(${90 - tilt} 80 86)`}>
        <rect x="52" y="82" width="56" height="6" rx="2" fill="#2a5db0" stroke="#9fdcff" strokeWidth="1.5" />
      </g>
    </svg>
  );

  return (
    <ScenePanel
      title="Aim the solar array"
      hint={`The Sun is at ${sun}° today. Panels make the most power when they face it head-on.${dusty ? " Dusty skies today: −3 power." : ""}`}
      graphic={graphic}
      flash={flash}
    >
      <label className="block text-[11px] font-bold text-white/70">
        Panel angle: {tilt}° · Power match {Math.round(match * 10)}%
        <input
          type="range"
          min={10}
          max={90}
          step={5}
          value={tilt}
          onChange={(e) => setTilt(Number(e.target.value))}
          className="mt-1 w-full accent-yellow-300"
        />
      </label>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/50">You would get:</span>
        <EffectChips effects={effects} />
        <span className="text-[10px] text-white/40">(motors use 1 energy)</span>
      </div>
      <CommitButton
        label="Lock in panel angle · 1 crew action"
        disabled={actionsLeft <= 0 || gain <= 1 || !canAfford(effects)}
        reason={actionsLeft <= 0 ? "No crew actions left" : "Aim closer to the Sun"}
        onClick={() =>
          commit(
            {
              id: `aim-${tilt}`,
              title: `Aim solar array to ${tilt}°`,
              effects,
              coachNote: "Spending crew time to aim the panels pays back as extra power.",
            },
            "Solar panels collect the most light when they point straight at the Sun. Dust on Mars cuts that further.",
          )
        }
      />
    </ScenePanel>
  );
}

/* ------------------------------------------------------------------ */
/* Radiation Shelter — regolith bags                                  */
/* ------------------------------------------------------------------ */

const SHELTER_OPTIONS = [
  { value: 1, label: "1 bag", shielding: 4, energy: -2, through: 65 },
  { value: 2, label: "2 bags", shielding: 7, energy: -4, through: 45 },
  { value: 3, label: "3 bags", shielding: 9, energy: -6, through: 32 },
  { value: 4, label: "4 bags", shielding: 10, energy: -8, through: 28 },
];

function ShelterScene({ onResult }: SceneProps) {
  const [bags, setBags] = useState(2);
  const { actionsLeft, canAfford, commit, flash } = useCrewCommit(onResult);
  const opt = SHELTER_OPTIONS.find((o) => o.value === bags)!;
  const effects: Effects = { shielding: opt.shielding, energy: opt.energy };

  const graphic = (
    <svg viewBox="0 0 160 110" className="h-auto w-full" role="img" aria-label="Stack of regolith bags protecting the shelter">
      <rect x="6" y="96" width="148" height="6" rx="3" fill="#c98b5a" />
      <rect x="104" y="40" width="46" height="56" rx="10" fill="#cfd8e6" stroke="#9fdcff" strokeWidth="2" />
      <text x="127" y="72" textAnchor="middle" fontSize="9" fontWeight="800" fill="#10243D">
        crew
      </text>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.rect
          key={i}
          x="78"
          y={78 - i * 20}
          width="22"
          height="17"
          rx="6"
          fill={i < bags ? "#b07a4a" : "transparent"}
          stroke={i < bags ? "#e8b783" : "#ffffff55"}
          strokeDasharray={i < bags ? undefined : "3 3"}
          initial={false}
          animate={{ opacity: i < bags ? 1 : 0.5 }}
        />
      ))}
      {[22, 44, 66, 88].map((y, i) => (
        <g key={y}>
          <line x1="8" y1={y} x2="74" y2={y} stroke="#ff6b81" strokeWidth="2" strokeDasharray="5 4" />
          <text x="8" y={y - 3} fontSize="7" fill="#ff9aa8">
            {i === 0 ? "radiation" : ""}
          </text>
        </g>
      ))}
    </svg>
  );

  return (
    <ScenePanel
      title="Build a regolith wall"
      hint="Bags of Moon/Mars soil (regolith) block radiation. Moving them costs energy, and each extra bag helps a little less."
      graphic={graphic}
      flash={flash}
    >
      <Segmented
        options={SHELTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={bags}
        onChange={setBags}
      />
      <div>
        <div className="mb-1 flex justify-between text-[10px] font-bold text-white/60">
          <span>Radiation getting through (simplified)</span>
          <span>{opt.through}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#A78BFA] transition-all" style={{ width: `${opt.through}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/50">You would get:</span>
        <EffectChips effects={effects} />
      </div>
      <CommitButton
        label={`Stack ${bags} bag${bags > 1 ? "s" : ""} · 1 crew action`}
        disabled={actionsLeft <= 0 || !canAfford(effects)}
        reason={actionsLeft <= 0 ? "No crew actions left" : "Not enough energy"}
        onClick={() =>
          commit(
            {
              id: `bags-${bags}`,
              title: `Regolith wall (${bags} bag${bags > 1 ? "s" : ""})`,
              effects,
              coachNote: "More mass blocks more radiation, but the energy you spend can't power something else.",
            },
            "Space radiation is blocked by mass. Thicker walls protect better, with smaller and smaller gains.",
          )
        }
      />
    </ScenePanel>
  );
}

/* ------------------------------------------------------------------ */
/* Research Lab — microscope                                          */
/* ------------------------------------------------------------------ */

type SampleId = "dust" | "plant" | "ice";

const SAMPLES: Record<
  SampleId,
  { label: string; color: string; bonus: Effects; lesson: string }
> = {
  dust: {
    label: "Moon dust",
    color: "#a8a29e",
    bonus: { shielding: 1 },
    lesson: "Regolith (surface dust) is sharp and sticky. Studying it helps design better filters and radiation walls.",
  },
  plant: {
    label: "Plant leaf",
    color: "#7DDE6A",
    bonus: { food: 1 },
    lesson: "Studying how plants grow in space helps plan food for long missions.",
  },
  ice: {
    label: "Water ice",
    color: "#9fdcff",
    bonus: { water: 2 },
    lesson: "Water ice near the lunar poles could someday be melted for drinking and split into oxygen.",
  },
};

const DEPTHS = [
  { value: 1, label: "Quick scan" },
  { value: 2, label: "Deep scan" },
];

function LabScene({ onResult }: SceneProps) {
  const [sample, setSample] = useState<SampleId>("dust");
  const [depth, setDepth] = useState(1);
  const { actionsLeft, canAfford, commit, flash } = useCrewCommit(onResult);
  const s = SAMPLES[sample];

  const effects: Effects = { science: depth === 1 ? 3 : 6, energy: depth === 1 ? -2 : -5 };
  (Object.keys(s.bonus) as ResourceKey[]).forEach((k) => {
    effects[k] = (s.bonus[k] ?? 0) * depth;
  });

  const graphic = (
    <svg viewBox="0 0 120 110" className="h-auto w-full" role="img" aria-label="Microscope looking at a sample">
      <rect x="22" y="98" width="76" height="8" rx="3" fill="#4aa8ff" />
      <rect x="55" y="30" width="10" height="68" fill="#9aa7b8" />
      <path d="M60 36 Q96 26 88 62" fill="none" stroke="#cfd8e6" strokeWidth="8" strokeLinecap="round" />
      <rect x="48" y="14" width="24" height="22" rx="5" fill="#2a5db0" stroke="#9fdcff" strokeWidth="2" />
      <ellipse cx="60" cy="88" rx="22" ry="7" fill="#0d2a5c" stroke="#9fdcff" />
      <motion.circle cx="60" cy="86" r="7" fill={s.color} initial={false} animate={{ scale: depth === 2 ? 1.25 : 1 }} />
    </svg>
  );

  return (
    <ScenePanel
      title="Microscope"
      hint="Pick a sample and how deeply to scan it. Deeper scans find more but use more power."
      graphic={graphic}
      flash={flash}
    >
      <Segmented
        options={(Object.keys(SAMPLES) as SampleId[]).map((id) => ({ value: id, label: SAMPLES[id].label }))}
        value={sample}
        onChange={setSample}
      />
      <Segmented options={DEPTHS} value={depth} onChange={setDepth} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/50">You would get:</span>
        <EffectChips effects={effects} />
      </div>
      <CommitButton
        label={`Scan ${s.label.toLowerCase()} · 1 crew action`}
        disabled={actionsLeft <= 0 || !canAfford(effects)}
        reason={actionsLeft <= 0 ? "No crew actions left" : "Not enough energy"}
        onClick={() =>
          commit(
            {
              id: `scan-${sample}-${depth}`,
              title: `${depth === 1 ? "Quick" : "Deep"} scan: ${s.label}`,
              effects,
              coachNote: "Research pays off in Science Stars, but the instruments run on your energy.",
            },
            s.lesson,
          )
        }
      />
    </ScenePanel>
  );
}

/* ------------------------------------------------------------------ */

export function ModuleScene({ moduleId, onResult }: { moduleId: ModuleId } & SceneProps) {
  if (moduleId === "habitat") return <HabitatScene onResult={onResult} />;
  if (moduleId === "power") return <PowerScene onResult={onResult} />;
  if (moduleId === "shelter") return <ShelterScene onResult={onResult} />;
  if (moduleId === "lab") return <LabScene onResult={onResult} />;
  return null; // greenhouse has its own planting beds
}
