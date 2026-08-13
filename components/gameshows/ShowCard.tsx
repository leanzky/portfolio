"use client";

import type { Show, WebFit } from "@/data/gameshows";
import styles from "./gameshows.module.css";

const FIT_LABEL: Record<WebFit, string> = {
  excellent: "translates cleanly",
  good: "translates with work",
  workable: "translates, with caveats",
};

const FIT_DOT: Record<WebFit, string> = {
  excellent: "bg-emerald-400",
  good: "bg-amber-400",
  workable: "bg-rose-400",
};

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "gold" }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
        tone === "gold"
          ? "border-amber-400/40 text-amber-200/90"
          : "border-slate-400/25 text-slate-300/70"
      }`}
    >
      {children}
    </span>
  );
}

export function ShowCard({ show, index }: { show: Show; index: number }) {
  return (
    <details
      className={`${styles.card} group overflow-hidden rounded-2xl border border-slate-400/15 bg-[#0f1428]/80 transition hover:border-amber-400/35`}
    >
      <summary className="cursor-pointer list-none p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 font-mono text-lg font-bold text-amber-400/40">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-mono text-lg font-bold text-slate-50">{show.name}</h3>
              <span className="font-mono text-[11px] text-slate-400/60">{show.origin}</span>
            </div>

            <p className="mt-2 text-[15px] leading-relaxed text-slate-200/75">{show.premise}</p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300/70">
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${FIT_DOT[show.webFit]}`} />
                {FIT_LABEL[show.webFit]}
              </span>
              <Tag tone="gold">{show.effort}</Tag>
              {show.realtime && <Tag>realtime</Tag>}
              {show.contentHeavy && <Tag>content-heavy</Tag>}
            </div>

            <p className="mt-3 font-mono text-[11px] text-slate-400/55">{show.players}</p>
          </div>

          <span
            aria-hidden
            className={`${styles.chevron} mt-1 shrink-0 font-mono text-amber-400/50`}
          >
            &rsaquo;
          </span>
        </div>
      </summary>

      <div className="border-t border-slate-400/12 px-5 pb-6 pt-5 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300/70">
              The loop
            </h4>
            <ol className="mt-3 space-y-2">
              {show.loop.map((step, i) => (
                <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-slate-200/75">
                  <span className="font-mono text-xs text-amber-400/40">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-sky-300/70">
              What is actually hard
            </h4>
            <ul className="mt-3 space-y-2">
              {show.buildNotes.map((note, i) => (
                <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-slate-200/75">
                  <span
                    aria-hidden
                    className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-sky-400/60"
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-6 border-l-2 border-amber-400/40 pl-4 text-[15px] leading-relaxed text-amber-50/80">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300/80">
            Build this instead&nbsp;
          </span>
          {show.twist}
        </p>
      </div>
    </details>
  );
}
