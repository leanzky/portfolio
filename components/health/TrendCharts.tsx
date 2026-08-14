"use client";

import { useMemo } from "react";
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

const W = 720;
const H = 260;
const PAD = { top: 18, right: 62, bottom: 30, left: 46 };

type Line = { points: Point[]; color: string; label: string };

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
  const all = lines.flatMap((line) => line.points);

  const geometry = useMemo(() => {
    if (all.length === 0) return null;

    const dates = all.map((p) => p.date).sort();
    const first = dates[0];
    const last = dates[dates.length - 1];
    const spanDays = Math.max(1, daysBetween(first, last));

    const { min, max } = niceBounds(
      all.map((p) => p.value),
      reference ? [reference.value] : []
    );

    const x = (date: string) =>
      PAD.left + (daysBetween(first, date) / spanDays) * (W - PAD.left - PAD.right);
    const y = (value: number) =>
      PAD.top + (1 - (value - min) / (max - min)) * (H - PAD.top - PAD.bottom);

    // Four gridlines is enough to read a value without becoming a ledger.
    const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) / 3) * i);

    return { x, y, min, max, ticks, first, last };
  }, [all, reference]);

  if (!geometry || all.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted">
          Nothing to chart yet. Log a reading and this fills in.
        </p>
      </div>
    );
  }

  const { x, y, ticks } = geometry;

  return (
    <figure className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {lines.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4">
          {lines.map((line) => (
            <span key={line.label} className="flex items-center gap-2 text-xs text-muted">
              <span
                aria-hidden
                className="h-0.5 w-4 rounded-full"
                style={{ background: line.color }}
              />
              {line.label}
            </span>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={caption}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={GRID}
              strokeWidth={1}
              opacity={0.5}
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 4}
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
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(reference.value)}
              y2={y(reference.value)}
              stroke={AXIS_TEXT}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              opacity={0.65}
            />
            <text
              x={W - PAD.right + 6}
              y={y(reference.value) + 4}
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
            .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.date)} ${y(p.value)}`)
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
              {line.points.map((p) => (
                <circle
                  key={p.date}
                  cx={x(p.date)}
                  cy={y(p.value)}
                  r={4}
                  fill={line.color}
                  stroke="#e5e0d4"
                  strokeWidth={2}
                >
                  <title>{`${formatDate(p.date)} — ${p.value.toFixed(decimals)} ${unit}`}</title>
                </circle>
              ))}
              {/* Direct label on the latest point: identity without the legend */}
              <text
                x={x(last.date) + 9}
                y={y(last.value) + 4}
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

        <text x={PAD.left} y={H - 8} fontSize={11} fill={AXIS_TEXT}>
          {formatDate(geometry.first)}
        </text>
        <text x={W - PAD.right} y={H - 8} fontSize={11} fill={AXIS_TEXT} textAnchor="end">
          {formatDate(geometry.last)}
        </text>
      </svg>

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

export function BloodPressureChart({
  systolic,
  diastolic,
}: {
  systolic: Point[];
  diastolic: Point[];
}) {
  return (
    <Chart
      lines={[
        { points: systolic, color: SERIES_1, label: "Systolic (top number)" },
        { points: diastolic, color: SERIES_2, label: "Diastolic (bottom number)" },
      ]}
      reference={{ value: profile.homeBpTarget.systolic, label: "target" }}
      caption={`Home readings. The dashed line is the systolic target of ${profile.homeBpTarget.systolic}; the diastolic target is ${profile.homeBpTarget.diastolic}. Your doctor sets your real target — a single reading means little, the weekly average is the number that counts.`}
      unit="mmHg"
    />
  );
}

/** The table view — required relief for the orange series, and genuinely
    the easiest way to read your last few days. */
export function ReadingsTable({
  rows,
}: {
  rows: { date: string; systolic: number | null; diastolic: number | null; weight: number | null }[];
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
            <th className="px-4 py-3 font-medium">Systolic</th>
            <th className="px-4 py-3 font-medium">Diastolic</th>
            <th className="px-4 py-3 font-medium">Weight</th>
          </tr>
        </thead>
        <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
          {rows.map((row) => (
            <tr key={row.date} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-2.5">{formatDate(row.date)}</td>
              <td className="px-4 py-2.5">{row.systolic ?? "—"}</td>
              <td className="px-4 py-2.5">{row.diastolic ?? "—"}</td>
              <td className="px-4 py-2.5">{row.weight !== null ? `${row.weight} kg` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
