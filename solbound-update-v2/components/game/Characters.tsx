"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SamiMood } from "@/lib/game/types";
import { useGameStore } from "@/lib/game/store";

// صورة الأسترونوت حسب مزاج Sami
const SAMI_IMAGE: Record<SamiMood, string> = {
  happy: "/images/astronaut-wave.png",
  focused: "/images/astronaut-point.png",
  worried: "/images/astronaut-worried.png",
  sweating: "/images/astronaut-worried.png",
  tired: "/images/astronaut-worried.png",
  cheering: "/images/astronaut-thumbs.png",
};

export type NovaMood = "default" | "happy" | "worried" | "thinking";

const NOVA_IMAGE: Record<NovaMood, string> = {
  default: "/images/nova.png",
  happy: "/images/nova-happy.png",
  worried: "/images/nova-worried.png",
  thinking: "/images/nova-thinking.png",
};

export function SamiAvatar({
  mood,
  size = "md",
  waving = false,
}: {
  mood?: SamiMood;
  size?: "sm" | "md" | "lg";
  waving?: boolean;
}) {
  const storeMood = useGameStore((s) => s.samiMood);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const active = mood ?? storeMood;
  const dim = size === "lg" ? "h-44" : size === "sm" ? "h-16" : "h-28";
  const src = waving ? SAMI_IMAGE.happy : SAMI_IMAGE[active];

  return (
    <motion.div
      className={`relative ${dim} w-auto select-none`}
      animate={
        reduced
          ? undefined
          : waving
            ? { rotate: [-3, 3, -3] }
            : active === "cheering"
              ? { y: [0, -6, 0] }
              : active === "sweating"
                ? { x: [-1, 1, -1] }
                : { y: [0, -3, 0] }
      }
      transition={{ repeat: Infinity, duration: reduced ? 0 : 2.4, ease: "easeInOut" }}
      aria-label={`Sami looks ${active}`}
    >
      <Image
        src={src}
        alt=""
        width={408}
        height={612}
        className="h-full w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
      />
      {active === "sweating" && (
        <span className="absolute -right-2 top-2 text-sm text-cyan-200">💧</span>
      )}
      {active === "cheering" && (
        <span className="absolute -right-1 -top-1 text-sm text-yellow-300">✨</span>
      )}
    </motion.div>
  );
}

export function NovaBot({
  size = "md",
  speaking = false,
  mood = "default",
}: {
  size?: "sm" | "md" | "lg";
  speaking?: boolean;
  mood?: NovaMood;
}) {
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);
  const dim =
    size === "lg" ? "w-28 h-28" : size === "sm" ? "w-14 h-14" : "w-20 h-20";

  return (
    <motion.div
      className={`relative ${dim}`}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      aria-label="NOVA robot companion"
    >
      <Image
        src={NOVA_IMAGE[mood]}
        alt=""
        width={408}
        height={612}
        className="h-full w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
      />
      {speaking && (
        <motion.div
          className="absolute -right-1 top-0 h-3 w-3 rounded-full bg-cyan-300"
          animate={reduced ? undefined : { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}
    </motion.div>
  );
}

const CREW_IMAGE: Record<string, string> = {
  amara: "/images/crew-amara.png",
  chen: "/images/crew-chen.png",
  ortiz: "/images/crew-ortiz.png",
  sami: "/images/astronaut-wave.png",
  nova: "/images/nova.png",
};

export function CrewPortrait({
  crew,
}: {
  crew: "amara" | "chen" | "ortiz" | "sami" | "nova";
}) {
  const colors: Record<string, string> = {
    amara: "from-orange-300 to-amber-500",
    chen: "from-sky-300 to-blue-500",
    ortiz: "from-emerald-300 to-teal-500",
    sami: "from-cyan-200 to-cyan-500",
    nova: "from-white to-orange-300",
  };
  const labels: Record<string, string> = {
    amara: "Amara",
    chen: "Chen",
    ortiz: "Ortiz",
    sami: "Sami",
    nova: "NOVA",
  };
  const isPerson = crew === "amara" || crew === "chen" || crew === "ortiz";
  return (
    <div
      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/40 bg-gradient-to-br ${colors[crew]} shadow-lg`}
      title={labels[crew]}
      role="img"
      aria-label={labels[crew]}
    >
      <Image
        src={CREW_IMAGE[crew]}
        alt=""
        fill
        sizes="64px"
        className={isPerson ? "object-cover object-top" : "object-contain p-1"}
      />
    </div>
  );
}
