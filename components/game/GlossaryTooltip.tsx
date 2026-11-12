"use client";

import { useState } from "react";
import { getGlossaryDefinition } from "@/lib/game/glossary";

interface Props {
  term: string;
  children?: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const definition = getGlossaryDefinition(term);
  if (!definition) return <>{children ?? term}</>;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="underline decoration-dotted decoration-cyan-300/80 underline-offset-2 text-inherit font-semibold"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label={`What is ${term}?`}
      >
        {children ?? term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-2xl bg-[#0B1B33] border border-cyan-400/40 px-3 py-2 text-xs text-white shadow-xl"
        >
          <span className="block font-bold text-cyan-300 mb-1">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}
