import { getSupabaseClient } from "./supabase-client";
import type { DictionaryId } from "./dictionary";
import type { MoveType, RpcResult } from "./multiplayer-types";

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function createRoom(
  dictionaryId: DictionaryId,
  durationSeconds: number,
  name: string
): Promise<RpcResult> {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_dictionary_id: dictionaryId,
    p_duration_seconds: durationSeconds,
    p_name: name,
  });
  if (error) return { ok: false, reason: error.message };
  return data as RpcResult;
}

export async function joinRoom(code: string, name: string): Promise<RpcResult> {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("join_room", {
    p_code: code,
    p_name: name,
  });
  if (error) return { ok: false, reason: error.message };
  return data as RpcResult;
}

export async function startGame(roomId: string): Promise<RpcResult> {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("start_game", { p_room_id: roomId });
  if (error) return { ok: false, reason: error.message };
  return data as RpcResult;
}

export async function checkTimeout(roomId: string): Promise<RpcResult> {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("check_timeout", { p_room_id: roomId });
  if (error) return { ok: false, reason: error.message };
  return data as RpcResult;
}

export async function attemptMove(
  roomId: string,
  moveType: MoveType,
  cardId: string,
  slotIndex?: number
): Promise<RpcResult> {
  const supabase = requireClient();
  const { data, error } = await supabase.rpc("attempt_move", {
    p_room_id: roomId,
    p_move_type: moveType,
    p_card_id: cardId,
    p_slot_index: slotIndex ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return data as RpcResult;
}
