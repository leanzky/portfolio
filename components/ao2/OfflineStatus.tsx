"use client";

import { useEffect, useState } from "react";
import styles from "./ao2.module.css";

type Status = "checking" | "ready" | "unavailable";

/** Registers the offline service worker and says whether this phone now has a
    saved copy. Production only: in dev the chunks change on every edit. */
export function OfflineStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      Promise.resolve().then(() => setStatus("unavailable"));
      return;
    }
    navigator.serviceWorker
      .register("/ao2-sw.js", { scope: "/ao2-reviewer" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => setStatus("ready"))
      .catch(() => setStatus("unavailable"));
  }, []);

  const text =
    status === "ready"
      ? "Saved for offline use on this device."
      : status === "checking"
        ? "Saving an offline copy…"
        : "Offline copy not available in this browser.";
  return <p className={styles.offline}>{text}</p>;
}
