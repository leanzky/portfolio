"use client";

import { useRef, useState } from "react";
import { POSES, type Pose, type ProgressPhoto } from "@/lib/health/types";
import { deleteProgressPhoto, uploadProgressPhoto } from "@/lib/health/photos";
import { formatDate } from "@/lib/health/metrics";

/**
 * Progress photos.
 *
 * The camera is reached through a file input with `capture`, not
 * getUserMedia: on a phone that opens the real camera app, which takes a
 * better picture than a canvas grab and needs no permission dance. On a
 * desktop the same control falls back to a file picker, which is the
 * behaviour you want there anyway.
 */
export function PhotoTracker({
  photos,
  todayKey,
  todayWeight,
  onChanged,
}: {
  photos: ProgressPhoto[];
  todayKey: string;
  todayWeight: number | null;
  onChanged: () => Promise<void>;
}) {
  const [pose, setPose] = useState<Pose>("front");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparePose, setComparePose] = useState<Pose>("front");
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Let the same file be chosen twice in a row.
    event.target.value = "";
    if (!file) return;

    setError(null);
    setBusy(true);
    try {
      await uploadProgressPhoto({ file, takenOn: todayKey, pose, weightKg: todayWeight });
      await onChanged();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `Could not save that photo: ${cause.message}`
          : "Could not save that photo."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo: ProgressPhoto) {
    if (!window.confirm("Delete this photo? It cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteProgressPhoto(photo);
      await onChanged();
    } catch {
      setError("Could not delete that photo.");
    } finally {
      setBusy(false);
    }
  }

  const ofPose = photos.filter((photo) => photo.pose === comparePose);
  const newest = ofPose[0] ?? null;
  const oldest = ofPose.length > 1 ? ofPose[ofPose.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* ---------- capture ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">Add a photo</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Every four weeks is enough. The scale stalls for a fortnight and lies to you; photos do
          not.
        </p>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Pose</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {POSES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPose(option.id)}
                aria-pressed={pose === option.id}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  pose === option.id
                    ? "border-foreground/50 bg-foreground/[0.06] font-medium"
                    : "border-border text-muted hover:border-foreground/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{POSES.find((p) => p.id === pose)?.hint}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Take a photo"}
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-border px-5 py-3 text-sm font-medium transition hover:border-foreground/40 disabled:opacity-50"
          >
            Upload from gallery
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Make them comparable
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/75">
            <li>Same spot, same light, same time of day — morning, before eating, is easiest to repeat.</li>
            <li>Same clothes, and as few of them as you are comfortable with. Loose clothing hides exactly what you are trying to see.</li>
            <li>Phone at the same height and distance. A mark on the floor for your feet does more for consistency than anything else.</li>
            <li>Stand normally. Do not suck in, do not pose — you are measuring, not modelling.</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Photos go to a private storage bucket that only your browser identity can read, and are
            displayed through links that expire within the hour. They are never public.
          </p>
        </div>
      </div>

      {/* ---------- then and now ---------- */}
      {ofPose.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Then and now</h3>
            <div className="flex gap-2">
              {POSES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setComparePose(option.id)}
                  aria-pressed={comparePose === option.id}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    comparePose === option.id
                      ? "border-foreground/50 bg-foreground/[0.06] font-medium"
                      : "border-border text-muted hover:border-foreground/30"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[oldest, newest].map((photo, i) => (
              <figure key={i}>
                {photo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={`${i === 0 ? "First" : "Latest"} ${comparePose} photo`}
                    className="w-full rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center rounded-lg border border-dashed border-border text-xs text-muted">
                    No photo yet
                  </div>
                )}
                <figcaption className="mt-2 text-xs text-muted">
                  {photo ? (
                    <>
                      {i === 0 ? "First" : "Latest"} · {formatDate(photo.taken_on)}
                      {photo.weight_kg !== null && ` · ${photo.weight_kg} kg`}
                    </>
                  ) : (
                    "—"
                  )}
                </figcaption>
              </figure>
            ))}
          </div>

          {oldest?.weight_kg != null && newest?.weight_kg != null && (
            <p className="mt-3 text-sm font-medium text-emerald-800">
              {(oldest.weight_kg - newest.weight_kg).toFixed(1)} kg between these two photos.
            </p>
          )}
        </div>
      )}

      {/* ---------- everything ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">All photos</h3>
        {photos.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            None yet. Take your first set today — you cannot go back and take them later.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <figure key={photo.id} className="group relative">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={`${photo.pose} photo from ${photo.taken_on}`}
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="grid aspect-[3/4] place-items-center rounded-lg border border-border text-xs text-muted">
                    Unavailable
                  </div>
                )}
                <figcaption className="mt-1.5 text-xs text-muted">
                  {formatDate(photo.taken_on)} · {photo.pose}
                  {photo.weight_kg !== null && ` · ${photo.weight_kg} kg`}
                </figcaption>
                <button
                  type="button"
                  onClick={() => remove(photo)}
                  className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete photo"
                >
                  Delete
                </button>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
