import type { DataSource } from "@/lib/game/types";

/**
 * Label for every real-world fact: LIVE or ARCHIVED, plus the date.
 * Replaces the old "Powered by NASA Data" badge.
 */
export function SourceTag({ source, className = "" }: { source: DataSource; className?: string }) {
  const isLive = source.mode === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
        isLive
          ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
          : "border-amber-300/40 bg-amber-400/10 text-amber-200"
      } ${className}`}
      title={`${source.name} · ${isLive ? "fetched live" : "saved copy"} · ${source.date}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-300" : "bg-amber-300"}`} />
      {isLive ? "Live" : "Archived"} · {source.name} · {source.date}
    </span>
  );
}
