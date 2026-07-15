"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient background behind the whole site:
 * - three large soft color blobs drifting on slow (28–40s) loops
 * - a tint layer whose strength follows scroll position, so the
 *   background gradually warms and deepens as you move down the page
 * Fixed and GPU-friendly (transform/opacity only); respects reduced motion.
 */
export function BackgroundFX() {
  const tintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (tintRef.current) {
        tintRef.current.style.opacity = String(progress * 0.6);
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
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      {/* scroll-driven tint: warms the page as you scroll toward the footer */}
      <div
        ref={tintRef}
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,204,21,0.12),rgba(172,156,124,0.4))] transition-opacity duration-500 ease-out"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
