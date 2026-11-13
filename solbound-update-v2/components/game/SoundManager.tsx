"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";
import {
  playSound,
  preloadSounds,
  syncMusic,
  unlockAudio,
  useAudioSettings,
} from "@/lib/game/sound";
import type { ResourceKey } from "@/lib/game/types";

const METERS: ResourceKey[] = ["energy", "water", "oxygen", "food", "shielding"];

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
      // تغيير الشاشة
      if (s.screen !== prev.screen) {
        if (s.screen === "briefing" || (s.screen === "dashboard" && prev.screen === "briefing")) {
          playSound("transition");
        } else if (s.screen === "event") {
          playSound("notify");
        } else if (s.screen === "comic") {
          if (s.won === false) playSound("fail");
          else if (s.comicMode === "resolve") playSound("bonus");
        } else if (s.screen === "dashboard" && prev.screen === "comic" && s.day > prev.day) {
          playSound("levelup");
        } else if (s.screen === "debrief" && s.won === true) {
          playSound("win");
        }
      }

      // فتح مكتبة العلوم
      if (s.showScienceLibrary && !prev.showScienceLibrary) {
        playSound("notify");
      }

      // تحذير لما أي عداد ينزل تحت 40
      if (prev.screen !== "briefing" && prev.screen !== "title") {
        const crossed = METERS.some(
          (k) => prev.resources[k] >= 40 && s.resources[k] < 40,
        );
        if (crossed && s.won !== false) playSound("warning");
      }

      // أكشن ناجح للطاقم (طاقة = شحن، أي مورد تاني = مكافأة)
      if (s.day === prev.day && s.crewActionsRemaining < prev.crewActionsRemaining) {
        if (s.resources.energy > prev.resources.energy) {
          playSound("charge");
        } else if (METERS.some((k) => s.resources[k] > prev.resources[k])) {
          playSound("bonus");
        }
      }

      // ترقية وحدة
      const upgraded = s.modules.some((m, i) => prev.modules[i] && m.level > prev.modules[i].level);
      if (upgraded) playSound("levelup");
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

