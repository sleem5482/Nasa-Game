"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  Check,
  Music,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useGameStore } from "@/lib/game/store";
import { useAudioSettings } from "@/lib/game/sound";

function ToggleRow({
  icon,
  label,
  hint,
  on,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#071426] px-3 py-3 text-left transition hover:border-cyan-300/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black">{label}</span>
        <span className="block text-[11px] text-white/50">{hint}</span>
      </span>
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-black ${
          on ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200"
        }`}
      >
        {on ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export function SettingsPanel() {
  const open = useGameStore((s) => s.showSettings);
  const screen = useGameStore((s) => s.screen);
  const toggleSettings = useGameStore((s) => s.toggleSettings);
  const accessibility = useGameStore((s) => s.accessibility);
  const toggleLargeText = useGameStore((s) => s.toggleLargeText);
  const toggleReducedMotion = useGameStore((s) => s.toggleReducedMotion);
  const reduced = accessibility.reducedMotion;

  const musicOn = useAudioSettings((s) => s.musicOn);
  const sfxOn = useAudioSettings((s) => s.sfxOn);
  const setMusicOn = useAudioSettings((s) => s.setMusicOn);
  const setSfxOn = useAudioSettings((s) => s.setSfxOn);

  return (
    <>
      {/* زرار الإعدادات العايم — في شاشة البداية فيه زرار في الهيدر */}
      {screen !== "title" && (
        <button
          type="button"
          aria-label="Settings"
          onClick={() => toggleSettings(true)}
          className="fixed bottom-3 left-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#4aa8ff] bg-[#0d2a5c]/90 text-white hover:bg-[#12397a]"
        >
          <Settings className="h-5 w-5" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onClick={() => toggleSettings(false)}
          >
            <motion.div
              role="dialog"
              aria-label="Settings"
              className="w-full max-w-md rounded-[24px] border border-cyan-400/30 bg-[#10243D] p-5 text-white shadow-2xl"
              initial={reduced ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? undefined : { y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <Settings className="h-5 w-5 text-cyan-300" /> Settings
                </h2>
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => toggleSettings(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <ToggleRow
                  icon={<Music className="h-5 w-5" />}
                  label="Background music"
                  hint="Calm space music while you play"
                  on={musicOn}
                  onToggle={() => setMusicOn(!musicOn)}
                />
                <ToggleRow
                  icon={sfxOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  label="Sound effects"
                  hint="Clicks, alerts, rewards and typing"
                  on={sfxOn}
                  onToggle={() => setSfxOn(!sfxOn)}
                />
                <ToggleRow
                  icon={<Accessibility className="h-5 w-5" />}
                  label="Large text"
                  hint="Bigger words for easier reading"
                  on={accessibility.largeText}
                  onToggle={toggleLargeText}
                />
                <ToggleRow
                  icon={<Check className="h-5 w-5" />}
                  label="Reduced motion"
                  hint="Fewer animations"
                  on={accessibility.reducedMotion}
                  onToggle={toggleReducedMotion}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
