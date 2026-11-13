"use client";

import { create } from "zustand";

export type SoundName =
  | "click"
  | "transition"
  | "notify"
  | "warning"
  | "win"
  | "fail"
  | "levelup"
  | "bonus"
  | "charge";

type SoundConfig = {
  src: string;
  volume: number;
  /** وقف الصوت بعد المدة دي (ms) للأصوات الطويلة */
  maxMs?: number;
};

const SOUNDS: Record<SoundName, SoundConfig> = {
  click: { src: "/sounds/click.mp3", volume: 0.5 },
  transition: { src: "/sounds/transition.mp3", volume: 0.45, maxMs: 2500 },
  notify: { src: "/sounds/notify.mp3", volume: 0.6 },
  warning: { src: "/sounds/warning.mp3", volume: 0.5 },
  win: { src: "/sounds/win.mp3", volume: 0.7 },
  fail: { src: "/sounds/fail.mp3", volume: 0.6 },
  levelup: { src: "/sounds/levelup.mp3", volume: 0.6, maxMs: 3000 },
  bonus: { src: "/sounds/bonus.mp3", volume: 0.6 },
  charge: { src: "/sounds/charge.mp3", volume: 0.55, maxMs: 2500 },
};

const MUSIC_SRC = "/sounds/music.mp3";
const MUSIC_VOLUME = 0.2;
const TYPING_SRC = "/sounds/typing.mp3";
const TYPING_VOLUME = 0.45;
const PREF_KEY = "solbound-audio";

/* ------------------------------------------------------------------ */
/* إعدادات الصوت (موسيقى + مؤثرات) — بتتحفظ في المتصفح               */
/* ------------------------------------------------------------------ */

type AudioSettings = {
  musicOn: boolean;
  sfxOn: boolean;
  hydrate: () => void;
  setMusicOn: (value: boolean) => void;
  setSfxOn: (value: boolean) => void;
};

function persist(musicOn: boolean, sfxOn: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify({ musicOn, sfxOn }));
  } catch {
    /* ignore */
  }
}

export const useAudioSettings = create<AudioSettings>((set, get) => ({
  musicOn: true,
  sfxOn: true,

  hydrate: () => {
    try {
      const raw = window.localStorage.getItem(PREF_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { musicOn?: boolean; sfxOn?: boolean };
        set({
          musicOn: saved.musicOn !== false,
          sfxOn: saved.sfxOn !== false,
        });
      }
    } catch {
      /* ignore */
    }
    syncMusic();
  },

  setMusicOn: (musicOn) => {
    set({ musicOn });
    persist(musicOn, get().sfxOn);
    syncMusic();
  },

  setSfxOn: (sfxOn) => {
    set({ sfxOn });
    persist(get().musicOn, sfxOn);
    if (!sfxOn) stopTyping();
  },
}));

/* ------------------------------------------------------------------ */
/* الموسيقى الخلفية                                                    */
/* ------------------------------------------------------------------ */

let music: HTMLAudioElement | null = null;
let unlocked = false;

function getMusic(): HTMLAudioElement {
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.volume = MUSIC_VOLUME;
  }
  return music;
}

/** بتشغّل/توقف الموسيقى حسب الإعدادات وحسب هل المتصفح سمح بالصوت */
export function syncMusic() {
  if (typeof window === "undefined") return;
  const { musicOn } = useAudioSettings.getState();
  const el = getMusic();
  if (musicOn && unlocked && !document.hidden) {
    el.play().catch(() => {
      /* ممكن المتصفح يرفض لحد أول ضغطة */
    });
  } else {
    el.pause();
  }
}

/** بتتندهي عند أول ضغطة/ضغطة مفتاح (المتصفحات بتمنع الصوت قبلها) */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  syncMusic();
  tryTyping();
}

/* ------------------------------------------------------------------ */
/* صوت الكتابة (الـ typewriter في شاشة البداية)                        */
/* ------------------------------------------------------------------ */

let typing: HTMLAudioElement | null = null;
let typingWanted = false;

function tryTyping() {
  if (!typingWanted || typeof window === "undefined") return;
  if (!useAudioSettings.getState().sfxOn) return;
  if (!typing) {
    typing = new Audio(TYPING_SRC);
    typing.loop = true;
    typing.volume = TYPING_VOLUME;
  }
  typing.play().catch(() => {
    /* هيتعاد تشغيله عند أول تفاعل لو لسه بيكتب */
  });
}

export function startTyping() {
  typingWanted = true;
  tryTyping();
}

export function stopTyping() {
  typingWanted = false;
  if (typing) {
    typing.pause();
    typing.currentTime = 0;
  }
}

/* ------------------------------------------------------------------ */
/* المؤثرات الصوتية                                                    */
/* ------------------------------------------------------------------ */

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

export function preloadSounds() {
  (Object.keys(SOUNDS) as SoundName[]).forEach((name) => {
    if (cache[name]) return;
    const audio = new Audio(SOUNDS[name].src);
    audio.preload = "auto";
    audio.volume = SOUNDS[name].volume;
    cache[name] = audio;
  });
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  if (!useAudioSettings.getState().sfxOn) return;
  const config = SOUNDS[name];
  const base = cache[name] ?? new Audio(config.src);
  cache[name] = base;

  // clone عشان نفس الصوت يقدر يشتغل مرتين ورا بعض (زي الكليك)
  const audio = base.cloneNode(true) as HTMLAudioElement;
  audio.volume = config.volume;
  audio.play().catch(() => {
    /* المتصفح ممكن يمنع الصوت قبل أول تفاعل */
  });
  if (config.maxMs) {
    window.setTimeout(() => audio.pause(), config.maxMs);
  }
}
