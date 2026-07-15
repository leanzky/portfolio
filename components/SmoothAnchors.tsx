"use client";

import { useEffect } from "react";

/**
 * Handles in-page anchor navigation without ever writing a #hash into
 * the URL. This prevents the browser from jumping back down to a section
 * when the page is refreshed (F5) after clicking a nav link.
 * "#contact" is skipped — the ContactModal handles that one.
 */
export function SmoothAnchors() {
  useEffect(() => {
    // clean any hash left in the URL by previous visits/clicks
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#contact") return;

      const target =
        href === "#top" ? document.body : document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
