"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FlaskConical, Leaf, Lightbulb, Wind } from "lucide-react";
import { OUTPOST_SYSTEMS } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";

const ICONS = {
  wind: Wind,
  leaf: Leaf,
  flask: FlaskConical,
  bulb: Lightbulb,
} as const;

export function OutpostScene() {
  const planet = useGameStore((s) => s.planet);
  const systems = useGameStore((s) => s.systems);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const background =
    planet === "mars" ? "/images/colony-mars.png" : "/images/colony-moon.png";

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#071326] shadow-[0_20px_45px_rgba(3,10,21,0.7)]">
      <div className="relative h-[210px] sm:h-[260px]">
        <Image
          src={background}
          alt={planet === "mars" ? "Mars outpost" : "Moon outpost"}
          fill
          priority
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 backdrop-blur">
          Systems overview
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {OUTPOST_SYSTEMS.map((system) => {
          const Icon = ICONS[system.icon];
          const on = systems[system.id];
          return (
            <motion.div
              key={system.id}
              whileHover={reduced ? undefined : { y: -2 }}
              className={`rounded-2xl border px-2.5 py-2 ${
                on
                  ? "border-cyan-300/25 bg-cyan-400/10"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${on ? "text-cyan-300" : "text-white/35"}`} aria-hidden />
                <span className={`truncate text-[10px] font-black ${on ? "text-white" : "text-white/45"}`}>
                  {system.name}
                </span>
              </div>
              <p className={`mt-0.5 text-[9px] font-bold uppercase tracking-wide ${on ? "text-emerald-300" : "text-rose-300"}`}>
                {on ? `Running · ${system.powerCost} power` : "Stopped"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
