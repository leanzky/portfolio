/**
 * Tiny synthesized sound effects using the Web Audio API — no audio
 * files to load, so nothing to add to the bundle. Muted state is
 * remembered in localStorage. Safe to call from anywhere; no-ops on
 * the server or in browsers without AudioContext.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/**
 * Mute state as a tiny external store (read via useSyncExternalStore in
 * the component), so localStorage stays in sync across renders without
 * the SSR/hydration mismatch a plain useState+useEffect read would cause.
 */
const STORAGE_KEY = "scrabble-slam-muted";
let mutedValue = false;
let hydrated = false;
const listeners = new Set<() => void>();

export function getMutedSnapshot(): boolean {
  if (!hydrated && typeof window !== "undefined") {
    mutedValue = window.localStorage.getItem(STORAGE_KEY) === "1";
    hydrated = true;
  }
  return mutedValue;
}

export function getMutedServerSnapshot(): boolean {
  return false;
}

export function subscribeMuted(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setMuted(next: boolean): void {
  mutedValue = next;
  hydrated = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }
  listeners.forEach((l) => l());
}

function beep(freq: number, duration: number, type: OscillatorType = "sine") {
  if (getMutedSnapshot()) return;
  const audio = getContext();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + duration
  );
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export const sound = {
  valid: () => {
    beep(660, 0.12, "sine");
    setTimeout(() => beep(880, 0.14, "sine"), 60);
  },
  invalid: () => beep(120, 0.22, "sawtooth"),
  expand: () => {
    beep(520, 0.1, "triangle");
    setTimeout(() => beep(660, 0.1, "triangle"), 70);
    setTimeout(() => beep(880, 0.16, "triangle"), 140);
  },
  action: () => beep(340, 0.15, "square"),
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => beep(f, 0.2, "sine"), i * 90)
    );
  },
  timeout: () => beep(160, 0.4, "sawtooth"),
};
