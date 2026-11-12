"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FlaskConical, Home, Leaf, Shield, Sun } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import type { ModuleId } from "@/lib/game/types";

// image: null = لسه مفيش صورة للمبنى، بيظهر شكل مؤقت بأيقونة
// x و y = مكان أسفل منتصف المبنى (بالنسبة لحجم المشهد)
const MODULE_UI: Record<
  ModuleId,
  {
    icon: typeof Home;
    image: string | null;
    x: string;
    y: string;
    width: string;
    accent: string;
  }
> = {
  greenhouse: { icon: Leaf, image: "/images/building-greenhouse.png", x: "30%", y: "66%", width: "17%", accent: "#7DDE6A" },
  power: { icon: Sun, image: "/images/building-solar.png", x: "72%", y: "66%", width: "17%", accent: "#F5C542" },
  habitat: { icon: Home, image: "/images/building-oxygen.png", x: "50%", y: "80%", width: "19%", accent: "#36D6F5" },
  shelter: { icon: Shield, image: "/images/building-storage.png", x: "17%", y: "95%", width: "20%", accent: "#A78BFA" },
  lab: { icon: FlaskConical, image: "/images/building-lab.png", x: "83%", y: "95%", width: "20%", accent: "#FFD166" },
};

export function OutpostView() {
  const planet = useGameStore((s) => s.planet);
  const modules = useGameStore((s) => s.modules);
  const openModule = useGameStore((s) => s.openModule);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const background =
    planet === "mars" ? "/images/colony-mars.png" : "/images/colony-moon.png";

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#071326] shadow-[0_20px_45px_rgba(3,10,21,0.7)] sm:h-[400px]">
      <Image
        src={background}
        alt={planet === "mars" ? "Mars surface" : "Moon surface"}
        fill
        priority
        sizes="(min-width: 1024px) 700px, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      {modules.map((mod) => {
        const ui = MODULE_UI[mod.id];
        const Icon = ui.icon;
        return (
          <motion.button
            key={mod.id}
            type="button"
            className="absolute flex min-w-[84px] -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
            style={{ left: ui.x, top: ui.y, width: ui.width }}
            whileHover={reduced ? undefined : { scale: 1.06 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            onClick={() => openModule(mod.id)}
          >
            {ui.image ? (
              <Image
                src={ui.image}
                alt={mod.name}
                width={500}
                height={500}
                className="h-auto w-full drop-shadow-[0_8px_8px_rgba(0,0,0,0.4)]"
              />
            ) : (
              <span
                className="flex h-14 w-14 items-center justify-center rounded-[20px] border-2 bg-[#0B1B33]/95 sm:h-16 sm:w-16"
                style={{
                  borderColor: ui.accent,
                  boxShadow: `0 0 18px ${ui.accent}55`,
                }}
              >
                <Icon className="h-7 w-7" style={{ color: ui.accent }} />
              </span>
            )}
            <span className="whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs">
              {mod.name}
              <span className="text-white/60"> · L{mod.level}</span>
            </span>
            <span
              className={`rounded-full bg-black/50 px-1.5 text-[10px] font-bold uppercase ${
                mod.status === "online"
                  ? "text-emerald-300"
                  : mod.status === "strained"
                    ? "text-amber-300"
                    : "text-rose-300"
              }`}
            >
              {mod.status}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
