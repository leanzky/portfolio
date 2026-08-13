"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  categories,
  doesNotTranslate,
  efforts,
  legalNotes,
  sharedMachinery,
  shows,
  type Category,
  type Effort,
} from "@/data/gameshows";
import { ShowCard } from "./ShowCard";
import { lock } from "@/lib/private-gate";
import styles from "./gameshows.module.css";

type Filter<T> = T | "all";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
        active
          ? "border-amber-400/70 bg-amber-400/15 text-amber-100"
          : "border-slate-400/25 text-slate-300/60 hover:border-amber-400/40 hover:text-amber-100/80"
      }`}
    >
      {children}
    </button>
  );
}

export function GameshowCatalogue() {
  const [category, setCategory] = useState<Filter<Category>>("all");
  const [effort, setEffort] = useState<Filter<Effort>>("all");
  const [soloOnly, setSoloOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return shows.filter((show) => {
      if (category !== "all" && show.category !== category) return false;
      if (effort !== "all" && show.effort !== effort) return false;
      // "No realtime needed" is the useful filter: those are the ones you can
      // finish alone, without rooms, sockets, or a second person to test with.
      if (soloOnly && show.realtime) return false;
      if (needle) {
        const haystack = `${show.name} ${show.premise} ${show.origin} ${show.category}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [category, effort, soloOnly, query]);

  const grouped = useMemo(() => {
    return categories
      .map((name) => ({ name, items: filtered.filter((show) => show.category === name) }))
      .filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <div className="relative">
      <div className={styles.stage} aria-hidden />

      <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        {/* ---------- hero ---------- */}
        <header>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400/60 transition-colors hover:text-amber-300"
          >
            &larr; back to portfolio
          </Link>

          <div className={`${styles.marquee} mt-10`}>
            <h1 className="font-mono text-3xl font-bold leading-tight text-slate-50 sm:text-5xl">
              Game show formats
              <span className="block text-amber-400">that work on the web</span>
            </h1>
          </div>

          <p className="mt-10 max-w-3xl text-[16px] leading-relaxed text-slate-200/75">
            {shows.length} television formats, judged on one question: what survives when you take
            away the studio, the audience and the host? Each entry has its core loop, the part that
            is genuinely hard to build, and a version worth making rather than cloning.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { value: String(shows.length), label: "formats catalogued" },
              {
                value: String(shows.filter((s) => !s.realtime).length),
                label: "buildable without realtime",
              },
              {
                value: String(shows.filter((s) => s.effort === "Weekend").length),
                label: "doable in a weekend",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-400/15 bg-[#0f1428]/70 p-4"
              >
                <p className="font-mono text-2xl font-bold text-amber-400">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* ---------- filters ---------- */}
        <section className="mt-14 rounded-2xl border border-slate-400/15 bg-[#0f1428]/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400/50">
              Genre
            </span>
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              all
            </Chip>
            {categories.map((name) => (
              <Chip key={name} active={category === name} onClick={() => setCategory(name)}>
                {name}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400/50">
              Effort
            </span>
            <Chip active={effort === "all"} onClick={() => setEffort("all")}>
              any
            </Chip>
            {efforts.map((name) => (
              <Chip key={name} active={effort === name} onClick={() => setEffort(name)}>
                {name}
              </Chip>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search formats..."
              aria-label="Search formats"
              className="min-w-0 flex-1 rounded-lg border border-slate-400/20 bg-[#0a0e1c] px-3.5 py-2 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500/50 focus:border-amber-400/50"
            />
            <Chip active={soloOnly} onClick={() => setSoloOnly((value) => !value)}>
              no realtime needed
            </Chip>
          </div>

          <p className="mt-4 font-mono text-[11px] text-slate-400/50">
            showing {filtered.length} of {shows.length}
          </p>
        </section>

        {/* ---------- the catalogue ---------- */}
        <section className="mt-12">
          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-slate-400/15 bg-[#0f1428]/60 p-8 text-center text-slate-300/60">
              Nothing matches those filters.
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.name} className="mb-12">
                <h2 className="font-mono text-sm uppercase tracking-[0.24em] text-amber-400/70">
                  {group.name}
                  <span className="ml-3 text-slate-500/60">{group.items.length}</span>
                </h2>
                <div className="mt-5 space-y-3">
                  {group.items.map((show) => (
                    <ShowCard key={show.id} show={show} index={shows.indexOf(show)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* ---------- shared machinery ---------- */}
        <section className="mt-8 border-t border-slate-400/15 pt-14">
          <h2 className="font-mono text-2xl font-bold text-slate-50">
            The machinery they all share
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-200/70">
            Build these once and the difference between formats becomes content and pacing rather
            than architecture. Everything below applies to almost every entry above.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sharedMachinery.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-sky-400/20 bg-sky-400/[0.03] p-5"
              >
                <h3 className="font-mono text-[15px] font-bold text-sky-100">{item.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-200/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- what does not translate ---------- */}
        <section className="mt-16">
          <h2 className="font-mono text-2xl font-bold text-slate-50">
            And the ones that do not translate
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-200/70">
            Worth knowing so you do not spend a month discovering it. In each of these the format
            is a frame around something physical, and removing the room removes the show.
          </p>

          <div className="mt-6 space-y-3">
            {doesNotTranslate.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-rose-400/20 bg-rose-400/[0.03] p-5"
              >
                <h3 className="font-mono text-[15px] font-bold text-rose-100/90">{item.name}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-200/70">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- legal ---------- */}
        <section className="mt-16">
          <h2 className="font-mono text-2xl font-bold text-slate-50">Before you publish one</h2>
          <ol className="mt-6 space-y-4">
            {legalNotes.map((note, i) => (
              <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-slate-200/75">
                <span className="font-mono text-amber-400/50">{String(i + 1).padStart(2, "0")}</span>
                <span>{note}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 font-mono text-[11px] leading-relaxed text-slate-400/50">
            Not legal advice — general orientation. Anything commercial deserves a real opinion from
            a real lawyer.
          </p>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-slate-400/15 pt-8">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400/60 transition-colors hover:text-amber-300"
          >
            &larr; back to portfolio
          </Link>
          <button
            type="button"
            onClick={lock}
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400/40 transition-colors hover:text-amber-300"
          >
            lock this page
          </button>
        </footer>
      </div>
    </div>
  );
}
