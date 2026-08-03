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
  ends_at: string | null;
  ended_at: string | null;
  winner_player_id: string | null;
  created_at: string;
};

export type PlayerPublicRow = {
  id: string;
  room_id: string;
  name: string;
  is_host: boolean;
  card_count: number;
  joined_at: string;
};

export type PlayerRow = {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  hand: import("./engine").Card[];
  is_host: boolean;
  joined_at: string;
};

export type MoveType =
  | "place_letter"
  | "place_expand"
  | "freeze"
  | "chaos"
  | "draw"
  | "swap";

export type RpcResult = {
  ok: boolean;
  reason?: string;
  [key: string]: unknown;
};
