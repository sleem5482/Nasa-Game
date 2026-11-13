"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { useGameStore } from "@/lib/game/store";

const FLIPBOOK_URLS = {
  moon: "https://heyzine.com/flip-book/33c28cfd4b.html#page/1",
  mars: "https://heyzine.com/flip-book/894c9e5b64.html#page/1",
} as const;

export function FlipbookModal() {
  const open = useGameStore((s) => s.showComicBook);
  const toggleComicBook = useGameStore((s) => s.toggleComicBook);
  const planet = useGameStore((s) => s.planet);
  const reduced = useGameStore((s) => s.accessibility.reducedMotion);

  const edition = planet === "mars" ? "mars" : "moon";
  const url = FLIPBOOK_URLS[edition];
  const label = edition === "mars" ? "Mars Comic" : "Moon Comic";

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleComicBook(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, toggleComicBook]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-4"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          onClick={() => toggleComicBook(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${label} flipbook`}
            className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[20px] border border-cyan-400/30 bg-[#10243D] shadow-2xl"
            initial={reduced ? false : { y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { y: 18, opacity: 0, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-sm font-black leading-tight text-white sm:text-base">
                    {label}
                  </h2>
                  <p className="text-[10px] font-semibold text-white/45">
                    {edition === "mars"
                      ? "Martian Outpost edition"
                      : "Lunar Outpost edition"}{" "}
                    · interactive flipbook
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Open in new tab</span>
                </a>
                <button
                  type="button"
                  aria-label="Close comic book"
                  onClick={() => toggleComicBook(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-[#071426]">
              <iframe
                src={url}
                title={`${label} interactive flipbook`}
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
