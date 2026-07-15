"use client";

import { useEffect } from "react";

/**
 * Adds scroll parallax to any element with a data-parallax="<factor>"
 * attribute: the element shifts by scrollY * factor, creating depth as
 * you scroll away from the hero. Respects prefers-reduced-motion.
 */
export function HeroParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    const fadeEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scrollfade]")
    );
    if (!els.length && !fadeEls.length) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      for (const el of els) {
        const factor = parseFloat(el.dataset.parallax ?? "0");
        el.style.transform = `translate3d(0, ${y * factor}px, 0)`;
      }
      // fade out as the visitor scrolls away from the hero
      const fade = Math.max(0, 1 - y / (window.innerHeight * 0.55));
      for (const el of fadeEls) {
        el.style.opacity = String(fade);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
