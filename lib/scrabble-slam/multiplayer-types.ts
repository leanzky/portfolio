import type { DictionaryId } from "./dictionary";

export type RoomStatus = "waiting" | "playing" | "won" | "timeout";

export type RoomRow = {
  id: string;
  code: string;
  dictionary_id: DictionaryId;
  duration_seconds: number;
  word: string | null;
  word_length: number | null;
  frozen: Record<string, string>; // slot index (string) -> ISO expiry timestamp
  status: RoomStatus;
  started_at: string | null;
  /** Always null since 0008: clocks belong to players, not the room. */
  ends_at: string | null;
  ended_at: string | null;
  winner_player_id: string | null;
  created_at: string;
  /** Whose turn it is. Null once the room is over. */
  current_turn_player_id: string | null;
  turn_started_at: string | null;
  turn_number: number;
  /** The slot changed by the most recent play, and who played it. */
  last_move_slot: number | null;
  last_move_player_id: string | null;
};

export type PlayerPublicRow = {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  card_count: number;
  joined_at: string;
  /** Turn order position, assigned at start. */
  seat: number | null;
  /** Banked clock. Null means Endless: no clock at all. */
  time_left_ms: number | null;
  eliminated: boolean;
};

export type PlayerRow = {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  hand: import("./engine").Card[];
  is_host: boolean;
  joined_at: string;
  seat: number | null;
  time_left_ms: number | null;
  eliminated: boolean;
};

export type MoveType =
  | "place_letter"
  | "pass"
  | "freeze"
  | "chaos"
  | "purge"
  | "draw"
  | "swap";

export type RpcResult = {
  ok: boolean;
  reason?: string;
  [key: string]: unknown;
};
