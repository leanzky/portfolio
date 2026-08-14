import type { NextRequest } from "next/server";
import { profile } from "@/data/health-plan";
import {
  getWidgetStatus,
  NotConfiguredError,
  timeInZone,
  todayKeyInZone,
  tokenMatches,
  type WidgetStatus,
} from "@/lib/health/server-status";

/**
 * The home-screen widget, as a complete standalone HTML document.
 *
 *   GET /api/health/widget?k=<HEALTH_WIDGET_TOKEN>[&theme=light][&bare=1]
 *
 * Android has no way for a web page to *be* a widget, so this is pointed at by
 * a widget app that renders a URL. That means it must survive a fairly dumb
 * WebView: everything is inline, there is not one external request, and the
 * only scripting is a meta refresh. It sizes itself off the viewport, which in
 * a widget host is the widget's own box, so one document covers a 2x2 and a
 * 4x2 without configuration.
 */

const REFRESH_SECONDS = 900; // 15 minutes; the host app usually refreshes too.

type Theme = {
  bg: string;
  ink: string;
  muted: string;
  line: string;
  good: string;
  warn: string;
};

// Status colours only, per the usual rule: they are always paired with a glyph
// and a written label, so the widget never depends on colour alone.
const DARK: Theme = {
  bg: "#16171a",
  ink: "#f2f0eb",
  muted: "#9d9a93",
  line: "rgba(242,240,235,0.14)",
  good: "#5cbe7b",
  warn: "#e2a83e",
};

const LIGHT: Theme = {
  bg: "#e5e0d4",
  ink: "#101010",
  muted: "#6d675c",
  line: "rgba(16,16,16,0.14)",
  good: "#2f7d4a",
  warn: "#8f5a0c",
};

function esc(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string
  );
}

function shell(theme: Theme, bare: boolean, body: string, href: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="refresh" content="${REFRESH_SECONDS}">
<meta name="robots" content="noindex,nofollow">
<title>Health today</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow:hidden;background:${bare ? "transparent" : theme.bg}}
  body{
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;
    color:${theme.ink};
    -webkit-font-smoothing:antialiased;
  }
  .card{
    display:flex;flex-direction:column;justify-content:space-between;gap:0.5em;
    height:100%;width:100%;
    padding:clamp(10px,4.5vw,20px);
    background:${bare ? "transparent" : theme.bg};
    border-radius:${bare ? "0" : "clamp(12px,5vw,24px)"};
    text-decoration:none;color:inherit;
    overflow:hidden;
  }
  .top{display:flex;align-items:center;gap:0.45em;min-width:0}
  .mark{
    flex:none;display:grid;place-items:center;
    width:1.5em;height:1.5em;border-radius:50%;
    font-size:clamp(12px,min(5.4vw,13vh),22px);line-height:1;
    font-weight:700;
  }
  .headline{
    flex:1;min-width:0;
    font-size:clamp(13px,min(6.6vw,15vh),26px);
    font-weight:650;letter-spacing:-0.015em;line-height:1.1;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .week{
    flex:none;font-size:clamp(8px,min(3vw,7vh),12px);
    letter-spacing:0.08em;text-transform:uppercase;color:${theme.muted};
  }
  .chips{display:flex;flex-wrap:wrap;gap:0.35em 0.75em;min-width:0}
  .chip{
    display:flex;align-items:center;gap:0.4em;
    font-size:clamp(9px,min(3.5vw,8.5vh),14px);line-height:1.2;
    white-space:nowrap;
  }
  .dot{flex:none;width:0.6em;height:0.6em;border-radius:50%}
  .on .dot{background:${theme.good}}
  .off .dot{border:0.14em solid ${theme.muted};background:transparent}
  .off{color:${theme.muted}}
  .foot{
    border-top:1px solid ${theme.line};padding-top:0.5em;
    font-size:clamp(8px,min(3.1vw,7.5vh),13px);line-height:1.3;
    color:${theme.muted};
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .foot b{color:${theme.ink};font-weight:600}
</style>
</head>
<body><a class="card" href="${esc(href)}">${body}</a></body>
</html>`;
}

function chip(label: string, done: boolean): string {
  return `<span class="chip ${done ? "on" : "off"}"><i class="dot"></i>${esc(label)}</span>`;
}

function statusCard(status: WidgetStatus, theme: Theme): string {
  const beforeStart = status.date < profile.startDate;

  const tone = status.logged ? theme.good : theme.warn;
  const glyph = status.logged ? "&#10003;" : "&#9679;";
  const headline = beforeStart
    ? "Starts Monday"
    : status.logged
      ? "Logged today"
      : "No entry yet";

  const chips = [
    chip(`Walk ${status.walkMinutes}/${status.walkGoalMinutes}m`, status.walkMinutes > 0),
    chip("Strength", status.strengthDone),
    chip("Food", status.ateLogged),
    chip("Meds", status.medsTaken),
  ].join("");

  // The footer is the motivation line: what you have banked so far, then when
  // this snapshot was taken so a frozen widget is obvious rather than trusted.
  const bits: string[] = [];
  if (status.streak > 0) bits.push(`<b>${status.streak}-day streak</b>`);
  if (status.latestWeightKg !== null) bits.push(`${status.latestWeightKg.toFixed(1)} kg`);
  if (status.lostKg !== null && status.lostKg > 0)
    bits.push(`<b>-${status.lostKg.toFixed(1)} kg</b>`);
  if (bits.length === 0) bits.push(`${status.daysLogged} days logged`);
  bits.push(esc(timeInZone()));

  const week = status.week > 0 ? `Week ${status.week}/12` : "Pre-start";

  return `
    <div class="top">
      <span class="mark" style="background:${tone};color:${theme.bg}">${glyph}</span>
      <span class="headline">${esc(headline)}</span>
      <span class="week">${esc(week)}</span>
    </div>
    <div class="chips">${chips}</div>
    <div class="foot">${bits.join(" &middot; ")}</div>`;
}

function messageCard(title: string, detail: string, theme: Theme): string {
  return `
    <div class="top">
      <span class="mark" style="background:${theme.warn};color:${theme.bg}">!</span>
      <span class="headline">${esc(title)}</span>
    </div>
    <div class="foot">${esc(detail)}</div>`;
}

export async function GET(request: NextRequest) {
  if (!tokenMatches(request.nextUrl.searchParams.get("k"))) {
    return new Response("Not found", { status: 404 });
  }

  const params = request.nextUrl.searchParams;
  const theme = params.get("theme") === "light" ? LIGHT : DARK;
  const bare = params.get("bare") === "1";
  const href = new URL("/calendar", request.nextUrl.origin).toString();

  let body: string;
  try {
    body = statusCard(await getWidgetStatus(), theme);
  } catch (cause) {
    body =
      cause instanceof NotConfiguredError
        ? messageCard("Not connected", "Widget environment variables are missing.", theme)
        : messageCard("Can't reach the log", `${todayKeyInZone()} · tap to open the tracker`, theme);
  }

  // Always 200, even on failure: a widget host shows its own broken-page state
  // for an error status, which tells you less than the card above does.
  return new Response(shell(theme, bare, body, href), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
