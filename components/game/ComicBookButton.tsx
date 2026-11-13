"use client";

import { BookOpen } from "lucide-react";
import { useGameStore } from "@/lib/game/store";

export function ComicBookButton({
  iconOnly = false,
  showLabel = false,
}: {
  iconOnly?: boolean;
  showLabel?: boolean;
}) {
  const toggleComicBook = useGameStore((s) => s.toggleComicBook);
  const planet = useGameStore((s) => s.planet);
  const edition = planet === "mars" ? "Mars" : "Moon";
  const label = `${edition} Comic`;

  return (
    <button
      type="button"
      aria-label={`Open ${label} flipbook`}
      onClick={() => toggleComicBook(true)}
      className={
        iconOnly
          ? "flex h-10 w-10 items-center justify-center rounded-full border-2 border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-100 transition hover:bg-fuchsia-500/25"
          : "inline-flex items-center gap-2 rounded-full border-2 border-fuchsia-300/60 bg-fuchsia-500/15 px-4 py-2 text-sm font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/25"
      }
    >
      <BookOpen className="h-4 w-4" aria-hidden />
      {!iconOnly && (
        <span className={showLabel ? "inline" : "hidden sm:inline"}>
          {showLabel ? label : "Comic Book"}
        </span>
      )}
    </button>
  );
}
