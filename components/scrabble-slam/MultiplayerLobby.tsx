"use client";

import { useState } from "react";
import {
  dictionaries,
  DictionaryId,
  WORD_LENGTHS,
  WordLength,
} from "@/lib/scrabble-slam/dictionary";
import { ensureAnonymousSession } from "@/lib/supabase-client";
import { createRoom, joinRoom } from "@/lib/scrabble-slam/multiplayer-actions";

const DURATIONS = [90, 120, 60];

export function MultiplayerLobby({
  onJoined,
}: {
  onJoined: (roomId: string, playerId: string, code: string) => void;
}) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dictionaryId, setDictionaryId] = useState<DictionaryId>("standard");
  const [wordLength, setWordLength] = useState<WordLength>(4);
  const [duration, setDuration] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Enter a name first.");
      return;
    }
    setBusy(true);
    setError(null);
    const userId = await ensureAnonymousSession();
    if (!userId) {
      setError("Couldn't connect to the multiplayer server. Try again shortly.");
      setBusy(false);
      return;
    }
    const result = await createRoom(dictionaryId, duration, name.trim(), wordLength);
    setBusy(false);
    if (!result.ok) {
      setError(result.reason ?? "Couldn't create the room.");
      return;
    }
    onJoined(result.room_id as string, result.player_id as string, result.code as string);
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError("Enter a name first.");
      return;
    }
    if (code.trim().length < 4) {
      setError("Enter the room code your friend shared.");
      return;
    }
    setBusy(true);
    setError(null);
    const userId = await ensureAnonymousSession();
    if (!userId) {
      setError("Couldn't connect to the multiplayer server. Try again shortly.");
      setBusy(false);
      return;
    }
    const result = await joinRoom(code.trim(), name.trim());
    setBusy(false);
    if (!result.ok) {
      setError(
        result.reason === "room_not_found"
          ? "No room with that code."
          : result.reason === "room_already_started"
            ? "That game has already started."
            : (result.reason ?? "Couldn't join the room.")
      );
      return;
    }
    onJoined(result.room_id as string, result.player_id as string, code.trim().toUpperCase());
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500 text-center">
        Multiplayer
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-green-50 text-center">
        Play with a friend
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setMode("create")}
          className={`rounded-xl border-2 py-3 font-bold text-sm transition-colors ${
            mode === "create"
              ? "border-green-400 bg-green-400/10 text-green-50"
              : "border-green-900 text-green-600 hover:border-green-700"
          }`}
        >
          Create a room
        </button>
        <button
          onClick={() => setMode("join")}
          className={`rounded-xl border-2 py-3 font-bold text-sm transition-colors ${
            mode === "join"
              ? "border-green-400 bg-green-400/10 text-green-50"
              : "border-green-900 text-green-600 hover:border-green-700"
          }`}
        >
          Join a room
        </button>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wide text-green-700 mb-1.5">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="e.g. Leandro"
          className="w-full rounded-xl border border-green-800 bg-[#08140a] px-4 py-3 text-green-50 outline-none focus:border-green-400"
        />
      </div>

      {mode === "create" ? (
        <>
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">
              Word length
            </p>
            <div className="grid grid-cols-3 gap-2">
              {WORD_LENGTHS.map((len) => (
                <button
                  key={len}
                  onClick={() => setWordLength(len)}
                  className={`rounded-lg border-2 py-2 text-sm font-bold transition-colors ${
                    wordLength === len
                      ? "border-green-400 bg-green-400/10 text-green-50"
                      : "border-green-900 text-green-600 hover:border-green-700"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">
              Dictionary
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(dictionaries).map((dict) => (
                <button
                  key={dict.id}
                  onClick={() => setDictionaryId(dict.id)}
                  className={`rounded-lg border-2 py-2 text-xs font-bold transition-colors ${
                    dictionaryId === dict.id
                      ? "border-green-400 bg-green-400/10 text-green-50"
                      : "border-green-900 text-green-600 hover:border-green-700"
                  }`}
                >
                  {dict.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">
              Timer
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-lg border-2 py-2 text-xs font-bold transition-colors ${
                    duration === d
                      ? "border-lime-400 bg-lime-400/10 text-green-50"
                      : "border-green-900 text-green-600 hover:border-green-700"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={busy}
            className="mt-8 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create room"}
          </button>
        </>
      ) : (
        <>
          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wide text-green-700 mb-1.5">
              Room code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g. AB3XQ9"
              className="w-full rounded-xl border border-green-800 bg-[#08140a] px-4 py-3 text-green-50 tracking-widest uppercase outline-none focus:border-green-400"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={busy}
            className="mt-8 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition disabled:opacity-50"
          >
            {busy ? "Joining…" : "Join room"}
          </button>
        </>
      )}

      {error && <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>}
    </div>
  );
}
