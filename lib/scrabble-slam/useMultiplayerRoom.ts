"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { checkTimeout } from "./multiplayer-actions";
import type { PlayerPublicRow, PlayerRow, RoomRow } from "./multiplayer-types";
import type { Card } from "./engine";

export function useMultiplayerRoom(roomId: string | null, myPlayerId: string | null) {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerPublicRow[]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  // Every hand the server is willing to show us. RLS returns just our own
  // row while we're playing, and all of them once we've been eliminated,
  // so spectating needs no separate endpoint.
  const [visibleHands, setVisibleHands] = useState<PlayerRow[]>([]);
  const [ready, setReady] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !roomId || !myPlayerId) return;

    let cancelled = false;

    async function hydrate() {
      const [{ data: roomRow }, { data: playerRows }, { data: handRows }] = await Promise.all([
        supabase!.from("rooms").select("*").eq("id", roomId).single(),
        supabase!.from("player_public").select("*").eq("room_id", roomId),
        // Not filtered to our own id: RLS decides what comes back, which is
        // our row alone until we're eliminated and become a spectator.
        supabase!.from("players").select("*").eq("room_id", roomId),
      ]);
      if (cancelled) return;
      if (roomRow) setRoom(roomRow as RoomRow);
      if (playerRows) setPlayers(playerRows as PlayerPublicRow[]);
      if (handRows) {
        const rows = handRows as PlayerRow[];
        setVisibleHands(rows);
        const mine = rows.find((r) => r.id === myPlayerId);
        if (mine) setMyHand(mine.hand);
      }
      setReady(true);
    }
    hydrate();

    // Poll as a reliability fallback alongside the realtime subscription
    // below: postgres_changes delivery has an open, unresolved issue in
    // this app (see README "Known issues") where updates from OTHER
    // clients don't always arrive. Polling guarantees the UI still
    // converges to the true state within ~1.5s even if a push is missed.
    const pollId = window.setInterval(hydrate, 1500);

    const channel = supabase
      .channel(`room:${roomId}:${myPlayerId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => setRoom(payload.new as RoomRow)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "player_public", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setPlayers((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== (payload.old as PlayerPublicRow).id);
            }
            const next = payload.new as PlayerPublicRow;
            const exists = prev.some((p) => p.id === next.id);
            return exists
              ? prev.map((p) => (p.id === next.id ? next : p))
              : [...prev, next];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const next = payload.new as PlayerRow;
          if (next.id === myPlayerId) setMyHand(next.hand);
          // Room-wide rather than just our own row, so a spectator's view of
          // everyone's hands keeps up. RLS still gates what actually arrives.
          setVisibleHands((prev) =>
            prev.some((p) => p.id === next.id)
              ? prev.map((p) => (p.id === next.id ? next : p))
              : [...prev, next]
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [roomId, myPlayerId]);

  // Independent timeout ticker: catches the case where the clock runs out
  // with nobody making a move to trigger the check inside attempt_move.
  // Endless rooms hand out no clocks, so there's nothing to run out of.
  const endless = room?.duration_seconds === 0;
  useEffect(() => {
    if (!roomId || room?.status !== "playing" || endless) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      return;
    }
    tickRef.current = window.setInterval(() => {
      checkTimeout(roomId);
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [roomId, room?.status, endless]);

  return { room, players, myHand, visibleHands, ready };
}
