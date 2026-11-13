"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/lib/game/store";
import { BriefingScreen } from "./BriefingScreen";
import { DayScreen } from "./DayScreen";
import { DebriefScreen } from "./DebriefScreen";
import { DecisionScreen } from "./DecisionScreen";
import { EventScreen } from "./EventScreen";
import { ExecuteScreen } from "./ExecuteScreen";
import { FlipbookModal } from "./FlipbookModal";
import { RescueScreen } from "./RescueScreen";
import { ResultsScreen } from "./ResultsScreen";
import { ScienceLibrary } from "./ScienceLibrary";
import { SettingsPanel } from "./SettingsPanel";
import { SetupScreen } from "./SetupScreen";
import { SoundManager } from "./SoundManager";
import { TitleScreen } from "./TitleScreen";

export function GameApp() {
  const screen = useGameStore((s) => s.screen);
  const largeText = useGameStore((s) => s.accessibility.largeText);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  return (
    <div className={largeText ? "text-[17px] sm:text-[18px]" : ""}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        >
          {screen === "title" && <TitleScreen />}
          {screen === "briefing" && <BriefingScreen />}
          {screen === "setup" && <SetupScreen />}
          {screen === "day" && <DayScreen />}
          {screen === "event" && <EventScreen />}
          {screen === "decision" && <DecisionScreen />}
          {screen === "execute" && <ExecuteScreen />}
          {screen === "results" && <ResultsScreen />}
          {screen === "rescue" && <RescueScreen />}
          {screen === "debrief" && <DebriefScreen />}
        </motion.div>
      </AnimatePresence>
      <ScienceLibrary />
      <FlipbookModal />
      <SoundManager />
      <SettingsPanel />
    </div>
  );
}
