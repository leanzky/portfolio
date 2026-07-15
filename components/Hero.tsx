import fs from "fs";
import path from "path";
import { site } from "@/data/site";
import { HeroParallax } from "./HeroParallax";

/* Looks for portrait.png / portrait.jpg / portrait.webp in /public.
   Drop your photo there and it appears automatically. */
function findPortrait(): string | null {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", `portrait.${ext}`))) {
      return `/portrait.${ext}`;
    }
  }
  return null;
}

/* Giant display name: each letter slides up from behind a mask, staggered */
function GiantName({ fontSizeVw }: { fontSizeVw: number }) {
  return (
    <h1
      aria-label={site.hero.displayName}
      className="flex justify-center overflow-hidden font-extrabold uppercase text-yellow-400 select-none pointer-events-none leading-[0.78] tracking-[-0.03em]"
      style={{ fontSize: `${fontSizeVw}vw` }}
    >
      {site.hero.displayName.split("").map((letter, i) => (
        <span
          key={i}
          aria-hidden
          className="hero-letter inline-block"
          style={{ animationDelay: `${i * 0.09}s` }}
        >
          {letter}
        </span>
      ))}
    </h1>
  );
}

/* Headline: each line slides up from behind a mask, staggered */
function Headline({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      {site.hero.headlineLines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <span
            className="hero-line block"
            style={{ animationDelay: `${0.9 + i * 0.22}s` }}
          >
            {line}
          </span>
        </span>
      ))}
    </p>
  );
}

function CtaButtons({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-4 ${className}`}
    >
      <a
        href={site.ctaLink}
        className="font-alt uppercase tracking-wide bg-yellow-400 text-black px-7 py-3.5 rounded-xl text-sm font-extrabold transition duration-300 hover:brightness-95 hover:scale-105"
      >
        {site.ctaLabel}
      </a>
      <a
        href={site.resume}
        download
        className="font-alt uppercase tracking-wide bg-yellow-400 text-black px-7 py-3.5 rounded-xl text-sm font-extrabold transition duration-300 hover:brightness-95 hover:scale-105"
      >
        {site.resumeLabel}
      </a>
    </div>
  );
}

export function Hero() {
  const portrait = findPortrait();
  const fontSizeVw = Math.min(138 / site.hero.displayName.length, 26);

  return (
    <section id="top" className="overflow-hidden">
      <HeroParallax />

      {/* ============ Desktop composition ============ */}
      <div className="relative hidden lg:block h-svh min-h-[720px] max-h-[1000px]">
        {/* Giant display name behind everything (slow parallax layer) */}
        <div
          data-parallax="0.3"
          className="absolute inset-x-0 top-14 z-0 will-change-transform"
        >
          <GiantName fontSizeVw={fontSizeVw} />
        </div>

        {/* Portrait cutout, rising into the letters (mid parallax layer).
            Width is clamped so the head never crops on ultrawide screens. */}
        {portrait && (
          <div
            data-parallax="0.1"
            className="absolute z-10 inset-x-0 bottom-0 flex justify-center will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={portrait}
              alt={site.name}
              width={1100}
              height={1232}
              fetchPriority="high"
              className="hero-rise hero-d1 w-[clamp(400px,37vw,640px)] h-auto drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)]"
            />
          </div>
        )}

        {/* Left column: headline + signature, hugging the portrait's left edge.
            Anchor tracks the portrait's clamped width so they never overlap. */}
        <div
          data-parallax="0.16"
          data-scrollfade
          className="absolute z-20 top-[40%] text-right left-4 right-[calc(50%+clamp(215px,19.5vw,345px))] will-change-transform"
        >
          <Headline className="font-display uppercase text-[min(3.4vw,4.5rem)] font-bold tracking-tight leading-[1.05]" />
          <div className="hero-rise hero-d3 mt-8 text-xl leading-snug text-foreground/90">
            {site.hero.tagline.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        {/* Right column: subheadline, hugging the portrait's right edge */}
        <div
          data-parallax="0.22"
          data-scrollfade
          className="absolute z-20 top-[44%] right-4 left-[calc(50%+clamp(215px,19.5vw,345px))] will-change-transform"
        >
          <p className="hero-rise hero-d2 max-w-sm font-alt text-xl leading-relaxed text-foreground/80">
            {site.hero.subheadline}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="absolute z-20 inset-x-0 bottom-[5%] flex justify-center">
          <CtaButtons className="hero-rise hero-d3" />
        </div>
      </div>

      {/* ============ Mobile / tablet composition ============ */}
      <div className="lg:hidden pt-24 pb-16 px-6">
        {/* -mx-6 lets the name use the full screen width so it never clips */}
        <div className="-mx-6">
          <GiantName fontSizeVw={fontSizeVw} />
        </div>

        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portrait}
            alt={site.name}
            width={1100}
            height={1232}
            fetchPriority="high"
            className="hero-rise hero-d1 mx-auto -mt-[9vw] w-72 sm:w-80 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
          />
        )}

        <Headline className="hero-rise hero-d2 mt-8 text-center font-display uppercase text-4xl sm:text-5xl font-bold tracking-tight leading-[1.02]" />

        <CtaButtons className="hero-rise hero-d3 mt-8" />

        <p className="hero-rise hero-d3 mt-10 text-center font-alt text-lg text-muted leading-relaxed max-w-md mx-auto">
          {site.hero.subheadline}
        </p>

        <div className="hero-rise hero-d3 mt-8 text-center text-lg leading-snug">
          {site.hero.tagline.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
