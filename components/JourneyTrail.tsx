"use client";

import { useEffect, useRef } from "react";
import type { TimelineEntry } from "@/data/site";

/* "2020" -> "'20", anything else (e.g. "Today") stays as-is */
function shortYear(year: string) {
  return /^\d{4}$/.test(year) ? `'${year.slice(2)}` : year;
}

/**
 * Scroll-driven journey timeline, recreating the reference animation:
 * - the card nearest the viewport focus is fully visible, others ghost out
 * - the curved trail between cards draws itself as you scroll
 * - the yellow dots pop in as the line reaches them
 * Everything scrubs forward AND backward with the scroll position.
 */
export function JourneyTrail({ entries }: { entries: TimelineEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-trail-card]")
    );
    const conns = Array.from(
      container.querySelectorAll<HTMLElement>("[data-trail-conn]")
    );

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      // static fallback: everything fully drawn and visible
      cards.forEach((c) => {
        c.style.opacity = "1";
        c.style.transform = "none";
      });
      conns.forEach((conn) => {
        const path = conn.querySelector<SVGPathElement>("[data-trail-path]");
        if (path) path.style.strokeDashoffset = "0";
        conn
          .querySelectorAll<HTMLElement>("[data-trail-dot]")
          .forEach((d) => (d.style.transform = "translate(-50%, -50%) scale(1)"));
      });
      return;
    }

    let raf = 0;

    const update = () => {
      const vh = window.innerHeight;
      const focus = vh * 0.45; // vertical focus line of the viewport

      // Cards: opacity + scale by distance from the focus line.
      // The focused card pops out slightly bigger; past/future cards ghost out.
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - focus);
        // fully visible within a comfort band, then fall off
        const t = Math.min(Math.max((dist - vh * 0.18) / (vh * 0.55), 0), 1);
        card.style.opacity = String(1 - t * 0.75);
        card.style.transform = `scale(${1 + (1 - t) * 0.06})`;
      }

      // Connectors: line draws as the segment passes through the viewport
      for (const conn of conns) {
        const r = conn.getBoundingClientRect();
        const start = vh * 0.85; // drawing begins when the top edge reaches here
        const span = r.height + vh * 0.3;
        const p = Math.min(Math.max((start - r.top) / span, 0), 1);

        const path = conn.querySelector<SVGPathElement>("[data-trail-path]");
        if (path) path.style.strokeDashoffset = String(100 - p * 100);

        const [dotStart, dotEnd] = Array.from(
          conn.querySelectorAll<HTMLElement>("[data-trail-dot]")
        );
        if (dotStart)
          dotStart.style.transform = `translate(-50%, -50%) scale(${
            p > 0.02 ? 1 : 0
          })`;
        if (dotEnd)
          dotEnd.style.transform = `translate(-50%, 50%) scale(${
            p > 0.97 ? 1 : 0
          })`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {entries.map((entry, i) => {
        const isLast = i === entries.length - 1;
        const onLeft = i % 2 === 0;
        const startX = onLeft ? 25 : 75;
        const endX = onLeft ? 75 : 25;
        return (
          <div key={entry.year + entry.title}>
            <div className="md:grid md:grid-cols-2 md:gap-x-10">
              <div className={onLeft ? "md:col-start-1" : "md:col-start-2"}>
                <div
                  data-trail-card
                  className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] will-change-[opacity,transform]"
                  style={{ opacity: 0.25 }}
                >
                  <p className="font-display text-6xl md:text-7xl font-bold tracking-tighter text-yellow-400 select-none">
                    {shortYear(entry.year)}
                  </p>
                  <h3 className="mt-4 text-2xl md:text-[1.75rem] font-semibold tracking-tight">
                    {entry.title}
                  </h3>
                  <p className="mt-3 text-base md:text-lg text-muted leading-relaxed">
                    {entry.text}
                  </p>
                  {entry.image && (
                    <figure className="mt-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.image}
                        alt={entry.caption ?? entry.title}
                        loading="lazy"
                        decoding="async"
                        className="rounded-xl border border-border w-full"
                      />
                      {entry.caption && (
                        <figcaption className="mt-2 text-xs font-mono text-muted">
                          {entry.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              </div>
            </div>

            {!isLast && (
              <>
                {/* Desktop: self-drawing curved trail */}
                <div
                  data-trail-conn
                  className="relative hidden md:block h-36 w-full"
                  aria-hidden
                >
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      data-trail-path
                      d={`M ${startX} 0 C ${startX} 65, ${endX} 35, ${endX} 100`}
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      pathLength={100}
                      strokeDasharray={100}
                      style={{ strokeDashoffset: 100 }}
                    />
                  </svg>
                  <span
                    data-trail-dot
                    className="absolute top-0 h-3 w-3 rounded-full bg-yellow-400 border border-foreground transition-transform duration-300"
                    style={{
                      left: `${startX}%`,
                      transform: "translate(-50%, -50%) scale(0)",
                    }}
                  />
                  <span
                    data-trail-dot
                    className="absolute bottom-0 h-3 w-3 rounded-full bg-yellow-400 border border-foreground transition-transform duration-300"
                    style={{
                      left: `${endX}%`,
                      transform: "translate(-50%, 50%) scale(0)",
                    }}
                  />
                </div>
                {/* Mobile: simple short trail between stacked cards */}
                <div
                  className="md:hidden mx-auto my-2 h-10 w-px bg-foreground/30"
                  aria-hidden
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
