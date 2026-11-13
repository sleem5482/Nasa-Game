"use client";

import { useEffect } from "react";
import { RESOURCE_ORDER } from "@/lib/game/constants";
import { useGameStore } from "@/lib/game/store";
import {
  playSound,
  preloadSounds,
  syncMusic,
  unlockAudio,
  useAudioSettings,
} from "@/lib/game/sound";

export function SoundManager() {
  useEffect(() => {
    useAudioSettings.getState().hydrate();
    preloadSounds();

    // المتصفح بيمنع الصوت لحد أول تفاعل → نفتح الصوت والموسيقى هنا
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    // وقّف الموسيقى لما التاب يتخبّى ورجّعها لما يرجع
    const onVisibility = () => syncMusic();
    document.addEventListener("visibilitychange", onVisibility);

    // 1) صوت الضغط على أي زرار
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest("button, a, [role='button']");
      if (!el || (el as HTMLButtonElement).disabled) return;
      if (el.getAttribute("data-no-sound") !== null) return;
      playSound("click");
    };
    document.addEventListener("click", onClick, true);

    // 2) أصوات الأحداث حسب تغيّر حالة اللعبة
    const unsubscribe = useGameStore.subscribe((s, prev) => {
      if (s.screen !== prev.screen) {
        if (s.screen === "briefing" || s.screen === "setup") {
          playSound("transition");
        } else if (s.screen === "event") {
          playSound("notify");
        } else if (s.screen === "execute") {
          playSound("notify");
        } else if (s.screen === "rescue") {
          playSound("fail");
        } else if (s.screen === "results") {
          if (s.lastResult?.rescueNeeded) playSound("fail");
          else if (s.lastResult?.tone === "great") playSound("bonus");
          else playSound("notify");
        } else if (s.screen === "debrief") {
          if (s.won === true) playSound("win");
          else if (s.won === false) playSound("fail");
        } else if (s.screen === "day" && s.day > prev.day) {
          playSound("levelup");
        }
      }

      // فتح مكتبة العلوم
      if (s.showScienceLibrary && !prev.showScienceLibrary) {
        playSound("notify");
      }

      // فتح الكوميك بوك
      if (s.showComicBook && !prev.showComicBook) {
        playSound("transition");
      }

      // تحذير لما أي عداد ينزل تحت 40
      if (prev.screen !== "briefing" && prev.screen !== "title") {
        const crossed = RESOURCE_ORDER.some(
          (key) => prev.resources[key] >= 40 && s.resources[key] < 40,
        );
        if (crossed && s.won !== false) playSound("warning");
      }

      // مكافأة لما العداد يتحسن بعد قرار
      if (s.screen === "results" && prev.screen !== "results") {
        const improved = RESOURCE_ORDER.some(
          (key) => s.resources[key] > prev.resources[key],
        );
        if (improved && !s.lastResult?.rescueNeeded) playSound("charge");
      }
    });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick, true);
      unsubscribe();
    };
  }, []);

  return null;
}
