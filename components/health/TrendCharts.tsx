"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/data/health-plan";
import { daysBetween, formatDate, type Point } from "@/lib/health/metrics";

/**
 * Two trend charts, hand-drawn as inline SVG — no chart library for two
 * charts on one page.
 *
 * Weight and blood pressure are different scales, so they are two charts
 * rather than one with two axes. Weight is a single series and needs no
 * legend (the title names it); blood pressure is two series, so it gets a
 * legend, direct labels on the last point, and the readings table below —
 * the orange sits under 3:1 against this page's beige surface, so identity
 * never rests on colour alone.
 */

/* Categorical slots 1 and 2, validated against the #e5e0d4 card surface:
   adjacent CVD ΔE 24.7, normal-vision ΔE 33.6. */
const SERIES_1 = "#2a78d6"; // blue — weight, systolic
const SERIES_2 = "#eb6834"; // orange — diastolic
const GRID = "#c2bbaa";
const AXIS_TEXT = "#6d675c";
const SURFACE = "#e5e0d4";

type Line = { points: Point[]; color: string; label: string };

/**
 * Measure the container so the SVG can use a viewBox in real CSS pixels.
 *
 * A fixed 720-unit viewBox squeezed into a 350px phone scales every label
 * down with it — 11px type renders at about 5px, which is unreadable. Drawing
 * at 1 unit = 1 pixel keeps text the size it says it is on every screen.
 */
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // The observer fires its first callback asynchronously after observe(),
    // so this never sets state synchronously inside the effect body.
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0].contentRect.width);
      setWidth((previous) => (previous === next ? previous : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function niceBounds(values: number[], extra: number[] = []) {
  const all = [...values, ...extra];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const pad = span * 0.15;
  return { min: min - pad, max: max + pad };
}

function Chart({
  lines,
  reference,
  caption,
  unit,
  decimals = 0,
}: {
  lines: Line[];
  reference?: { value: number; label: string };
  caption: string;
  unit: string;
  decimals?: number;
}) {
  const [containerRef, containerWidth] = useContainerWidth();
  const all = lines.flatMap((line) => line.points);

  // Fall back to a desktop-ish width for the first paint, before measuring.
  const width = Math.max(280, containerWidth || 660);
  const narrow = width < 480;
  const height = narrow ? 210 : 260;
  const pad = { top: 16, right: narrow ? 46 : 62, bottom: 26, left: narrow ? 38 : 46 };

  const geometry = useMemo(() => {
    if (all.length === 0) return null;

    const dates = all.map((point) => point.date).sort();
    const first = dates[0];
    const last = dates[dates.length - 1];
    const spanDays = Math.max(1, daysBetween(first, last));

    const { min, max } = niceBounds(
      all.map((point) => point.value),
      reference ? [reference.value] : []
    );

    const x = (date: string) =>
      pad.left + (daysBetween(first, date) / spanDays) * (width - pad.left - pad.right);
    const y = (value: number) =>
      pad.top + (1 - (value - min) / (max - min)) * (height - pad.top - pad.bottom);

    // Three gridlines on a phone, four on a wider screen — enough to read a
    // value off without the chart turning into a ledger.
    const steps = narrow ? 2 : 3;
    const ticks = Array.from({ length: steps + 1 }, (_, i) => min + ((max - min) / steps) * i);

    return { x, y, ticks, first, last };
  }, [all, reference, width, height, narrow, pad.left, pad.right, pad.top, pad.bottom]);

  return (
    <figure ref={containerRef} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {lines.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {lines.map((line) => (
            <span key={line.label} className="flex items-center gap-2 text-xs text-muted">
              <span
                aria-hidden
                className="h-0.5 w-4 shrink-0 rounded-full"
                style={{ background: line.color }}
              />
              {line.label}
            </span>
          ))}
        </div>
      )}

      {geometry === null ? (
        <p className="py-8 text-center text-sm text-muted">
          Nothing to chart yet. Log a reading and this fills in.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          role="img"
          aria-label={caption}
          className="block"
        >
          {geometry.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={geometry.y(tick)}
                y2={geometry.y(tick)}
                stroke={GRID}
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={pad.left - 7}
                y={geometry.y(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fill={AXIS_TEXT}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {tick.toFixed(decimals)}
              </text>
            </g>
          ))}

          {reference && (
            <g>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={geometry.y(reference.value)}
                y2={geometry.y(reference.value)}
                stroke={AXIS_TEXT}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                opacity={0.65}
              />
              <text
                x={width - pad.right + 5}
                y={geometry.y(reference.value) + 4}
                fontSize={11}
                fill={AXIS_TEXT}
              >
                {reference.label}
              </text>
            </g>
          )}

          {lines.map((line) => {
            if (line.points.length === 0) return null;
            const path = line.points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${geometry.x(p.date)} ${geometry.y(p.value)}`)
              .join(" ");
            const last = line.points[line.points.length - 1];

            return (
              <g key={line.label}>
                {line.points.length > 1 && (
                  <path
                    d={path}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {line.points.map((point) => (
                  <circle
                    key={point.date}
                    cx={geometry.x(point.date)}
                    cy={geometry.y(point.value)}
                    r={narrow ? 3.5 : 4}
                    fill={line.color}
                    stroke={SURFACE}
                    strokeWidth={2}
                  >
                    <title>{`${formatDate(point.date)} — ${point.value.toFixed(decimals)} ${unit}`}</title>
                  </circle>
                ))}
                {/* Direct label on the latest point: identity without a legend */}
                <text
                  x={geometry.x(last.date) + 8}
                  y={geometry.y(last.value) + 4}
                  fontSize={12}
                  fontWeight={600}
                  fill={line.color}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {last.value.toFixed(decimals)}
                </text>
              </g>
            );
          })}

          <text x={pad.left} y={height - 6} fontSize={11} fill={AXIS_TEXT}>
            {formatDate(geometry.first)}
          </text>
          {geometry.last !== geometry.first && (
            <text
              x={width - pad.right}
              y={height - 6}
              fontSize={11}
              fill={AXIS_TEXT}
              textAnchor="end"
            >
              {formatDate(geometry.last)}
            </text>
          )}
        </svg>
      )}

      <figcaption className="mt-2 text-xs leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

export function WeightChart({ points }: { points: Point[] }) {
  return (
    <Chart
      lines={[{ points, color: SERIES_1, label: "Weight" }]}
      reference={{ value: profile.goal12WeekKg, label: "goal" }}
      caption={`Weight in kilograms. The dashed line is the 12-week goal of ${profile.goal12WeekKg} kg. Expect flat stretches — they are normal.`}
      unit="kg"
      decimals={1}
    />
  );
}

/** Walking is the daily number now that blood pressure is not tracked, so it
    gets the second chart rather than a line in a table. */
export function WalkChart({ points }: { points: Point[] }) {
  return (
    <Chart
      lines={[{ points, color: SERIES_2, label: "Minutes walked" }]}
      reference={{ value: 30, label: "floor" }}
      caption="Minutes walked per day. The dashed line is the 30-minute floor — the number to hit on a day you do not feel like it."
      unit="min"
    />
  );
}

/** The table view — the easiest way to read your last few days on a phone,
    and the relief that lets the orange series carry meaning. */
export function ReadingsTable({
  rows,
}: {
  rows: { date: string; weight: number | null; walk: number; strength: boolean; ate: string | null }[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[420px] text-left text-sm">
        <caption className="px-4 pt-4 text-xs text-muted">
          Your last {rows.length} logged {rows.length === 1 ? "day" : "days"}.
        </caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-3 py-3 font-medium">Weight</th>
            <th className="px-3 py-3 font-medium">Walk</th>
            <th className="px-3 py-3 font-medium">Str</th>
            <th className="px-4 py-3 font-medium">Ate</th>
          </tr>
        </thead>
        <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
          {rows.map((row) => (
            <tr key={row.date} className="border-b border-border/60 last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5">{formatDate(row.date)}</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                {row.weight !== null ? `${row.weight} kg` : "—"}
              </td>
              <td className="px-3 py-2.5">{row.walk > 0 ? `${row.walk}m` : "—"}</td>
              <td className="px-3 py-2.5">{row.strength ? "✓" : "—"}</td>
              <td className="max-w-[16rem] truncate px-4 py-2.5 text-muted" title={row.ate ?? ""}>
                {row.ate ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
