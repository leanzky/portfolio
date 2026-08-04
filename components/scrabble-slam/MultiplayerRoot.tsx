"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useMultiplayerRoom } from "@/lib/scrabble-slam/useMultiplayerRoom";
import { leaveRoom } from "@/lib/scrabble-slam/multiplayer-actions";
import { useT } from "./LanguageToggle";
import { MultiplayerLobby } from "./MultiplayerLobby";
import { MultiplayerWaitingRoom } from "./MultiplayerWaitingRoom";
import { MultiplayerGame } from "./MultiplayerGame";

const STORAGE_KEY = "scrabble-slam-multiplayer-session";

type Session = { roomId: string; playerId: string };

// Session persistence modeled as a tiny external store (mirrors the mute
// preference in lib/scrabble-slam/sound.ts): reading sessionStorage happens
// in getSnapshot, which is where React expects impure/external reads,
// rather than in a useEffect+setState pair that fights hydration.
let sessionValue: Session | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function getSessionSnapshot(): Session | null {
  if (!hydrated && typeof window !== "undefined") {
    sessionValue = readFromStorage();
    hydrated = true;
  }
  return sessionValue;
}

function getSessionServerSnapshot(): Session | null {
  return null;
}

function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSession(next: Session | null): void {
  sessionValue = next;
  hydrated = true;
  if (typeof window !== "undefined") {
    if (next) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((l) => l());
}

export function MultiplayerRoot({ onExit }: { onExit: () => void }) {
  const t = useT();
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getSessionServerSnapshot
  );

  const { room, players, myHand, visibleHands, ready } = useMultiplayerRoom(
    session?.roomId ?? null,
    session?.playerId ?? null
  );

  // Closing the tab has to give the seat up too, or the room keeps a ghost
  // in it exactly like the manual Leave button used to.
  const activeRoomId = session?.roomId ?? null;
  useEffect(() => {
    if (!activeRoomId) return;
    const release = () => {
      void leaveRoom(activeRoomId);
    };
    window.addEventListener("pagehide", release);
    return () => window.removeEventListener("pagehide", release);
  }, [activeRoomId]);

  function handleJoined(roomId: string, playerId: string) {
    setSession({ roomId, playerId });
  }

  // Actually gives the seat back. Previously this only dropped the local
  // session, so the room still listed you and your friend saw you sitting
  // in a room you had already walked out of.
  function handleLeave() {
    const roomId = session?.roomId;
    setSession(null);
    if (roomId) void leaveRoom(roomId);
  }

  if (!session) {
    return (
      <div>
        <button
          onClick={onExit}
          className="ml-6 mt-6 text-green-700 hover:text-green-400 text-sm transition-colors font-mono"
        >
          {t("nav.back")}
        </button>
        <MultiplayerLobby onJoined={handleJoined} />
      </div>
    );
  }

  if (!ready || !room) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-green-600 font-mono">{t("lobby.creating")}</p>
      </div>
    );
  }

  if (room.status === "waiting") {
    return (
      <MultiplayerWaitingRoom
        room={room}
        players={players}
        myPlayerId={session.playerId}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <MultiplayerGame
      room={room}
      players={players}
      myHand={myHand}
      visibleHands={visibleHands}
      myPlayerId={session.playerId}
      onLeave={handleLeave}
    />
  );
}
