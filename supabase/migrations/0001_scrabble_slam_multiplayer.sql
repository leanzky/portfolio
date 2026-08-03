-- Scrabble Slam! multiplayer schema.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> paste -> Run).
--
-- Design notes:
-- - `players` holds each player's real hand and is only ever readable by
--   that player (RLS: user_id = auth.uid()). Nobody else's hand is ever
--   queryable or broadcast.
-- - `player_public` holds only a card COUNT, safe to broadcast to the room
--   so opponents can see "3 cards left" without ever seeing what they are.
--   Only the SECURITY DEFINER functions below write to it.
-- - `rooms` and `moves` are broadly readable (room code = the "secret"),
--   but only ever written by the functions below, never directly by
--   clients, so all game rules are enforced server-side.
-- - Dictionary validation happens against the `words` table (indexed),
--   which is the practical, server-side equivalent of the client's
--   in-memory Trie.

create extension if not exists pgcrypto;

-- ---------- Tables ----------

create table words (
  id bigserial primary key,
  dictionary_id text not null,
  length smallint not null,
  word text not null,
  unique (dictionary_id, word)
);
create index words_dict_len_idx on words (dictionary_id, length);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  dictionary_id text not null default 'standard',
  duration_seconds int not null default 90,
  word text,
  word_length smallint,
  frozen jsonb not null default '{}'::jsonb,
  status text not null default 'waiting'
    check (status in ('waiting', 'playing', 'won', 'timeout')),
  started_at timestamptz,
  ends_at timestamptz,
  ended_at timestamptz,
  winner_player_id uuid,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  user_id uuid not null,
  name text not null,
  hand jsonb not null default '[]'::jsonb,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table player_public (
  id uuid primary key references players (id) on delete cascade,
  room_id uuid not null references rooms (id) on delete cascade,
  name text not null,
  is_host boolean not null default false,
  card_count int not null default 0,
  joined_at timestamptz not null default now()
);

create table moves (
  id bigserial primary key,
  room_id uuid not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  type text not null,
  payload jsonb,
  accepted boolean not null,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------

alter table words enable row level security;
-- No policies: words are only ever read by SECURITY DEFINER functions below.

alter table rooms enable row level security;
create policy "rooms are readable if you know the id/code" on rooms
  for select using (true);

alter table players enable row level security;
create policy "you can only read your own hand" on players
  for select using (user_id = auth.uid());

alter table player_public enable row level security;
create policy "player_public is readable by anyone" on player_public
  for select using (true);

alter table moves enable row level security;
create policy "moves are readable by anyone" on moves
  for select using (true);

-- No INSERT/UPDATE/DELETE policies on rooms/players/player_public/moves for
-- the client roles: every mutation goes through the functions below, which
-- run as their owner and therefore bypass RLS deliberately and only there.

-- ---------- Helpers ----------

create or replace function random_letter() returns text
language sql
volatile
as $$
  with freq(letter, weight) as (
    values ('e',12),('a',9),('i',9),('o',8),('n',6),('r',6),('t',6),
           ('l',4),('s',4),('u',4),('d',4),('g',3),
           ('b',2),('c',2),('m',2),('p',2),('f',2),('h',2),('v',2),('w',2),('y',2),
           ('k',1),('j',1),('q',1),('x',1),('z',1)
  ), pool as (
    select letter from freq, generate_series(1, weight)
  )
  select letter from pool order by random() limit 1;
$$;

create or replace function random_room_code() returns text
language sql
volatile
as $$
  -- 6 chars, uppercase letters + digits, no ambiguous 0/O/1/I.
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1),
    ''
  )
  from generate_series(1, 6);
$$;

create or replace function deal_hand(p_dictionary_id text) returns jsonb
language plpgsql
volatile
as $$
declare
  v_include_expand boolean := p_dictionary_id <> 'hardcore';
  v_hand jsonb := '[]'::jsonb;
  v_letter_count int;
  v_min_vowels int;
  v_vowels text[] := array['a','e','i','o','u'];
  i int;
begin
  -- 16-card hand: freeze + chaos always; expand only if the dictionary
  -- supports a 5-letter length (hardcore is 6-letter only, no expand).
  v_letter_count := case when v_include_expand then 13 else 14 end;
  v_min_vowels := ceil(v_letter_count / 3.0);

  for i in 1..v_min_vowels loop
    v_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text,
      'kind', 'letter',
      'letter', v_vowels[(floor(random() * 5) + 1)::int]
    );
  end loop;

  for i in 1..(v_letter_count - v_min_vowels) loop
    v_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text,
      'kind', 'letter',
      'letter', random_letter()
    );
  end loop;

  v_hand := v_hand || jsonb_build_object(
    'id', 'a-' || gen_random_uuid()::text, 'kind', 'action', 'action', 'freeze'
  );
  v_hand := v_hand || jsonb_build_object(
    'id', 'a-' || gen_random_uuid()::text, 'kind', 'action', 'action', 'chaos'
  );
  if v_include_expand then
    v_hand := v_hand || jsonb_build_object(
      'id', 'a-' || gen_random_uuid()::text, 'kind', 'action', 'action', 'expand',
      'letter', random_letter()
    );
  end if;

  -- shuffle
  select jsonb_agg(elem order by random())
  into v_hand
  from jsonb_array_elements(v_hand) elem;

  return v_hand;
end;
$$;

create or replace function pick_starter_word(p_dictionary_id text) returns text
language sql
volatile
as $$
  select word
  from words
  where dictionary_id = p_dictionary_id
    and length = case when p_dictionary_id = 'hardcore' then 6 else 4 end
  order by random()
  limit 1;
$$;

-- ---------- RPCs ----------

create or replace function create_room(
  p_dictionary_id text,
  p_duration_seconds int,
  p_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_player_id uuid;
  v_code text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  v_code := random_room_code();

  insert into rooms (code, dictionary_id, duration_seconds)
  values (v_code, p_dictionary_id, p_duration_seconds)
  returning id into v_room_id;

  insert into players (room_id, user_id, name, is_host)
  values (v_room_id, auth.uid(), p_name, true)
  returning id into v_player_id;

  insert into player_public (id, room_id, name, is_host, card_count)
  values (v_player_id, v_room_id, p_name, true, 0);

  return jsonb_build_object('ok', true, 'room_id', v_room_id, 'code', v_code, 'player_id', v_player_id);
end;
$$;

create or replace function join_room(
  p_code text,
  p_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
  v_player_id uuid;
  v_existing uuid;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  select * into v_room from rooms where code = upper(p_code);
  if v_room.id is null then
    return jsonb_build_object('ok', false, 'reason', 'room_not_found');
  end if;
  if v_room.status <> 'waiting' then
    return jsonb_build_object('ok', false, 'reason', 'room_already_started');
  end if;

  select id into v_existing from players where room_id = v_room.id and user_id = auth.uid();
  if v_existing is not null then
    return jsonb_build_object('ok', true, 'room_id', v_room.id, 'player_id', v_existing, 'already_joined', true);
  end if;

  insert into players (room_id, user_id, name, is_host)
  values (v_room.id, auth.uid(), p_name, false)
  returning id into v_player_id;

  insert into player_public (id, room_id, name, is_host, card_count)
  values (v_player_id, v_room.id, p_name, false, 0);

  return jsonb_build_object('ok', true, 'room_id', v_room.id, 'player_id', v_player_id);
end;
$$;

create or replace function start_game(p_room_id uuid) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
  v_is_host boolean;
  v_player_count int;
  v_word text;
  v_word_len smallint;
  r record;
begin
  select * into v_room from rooms where id = p_room_id for update;
  if v_room.id is null then
    return jsonb_build_object('ok', false, 'reason', 'room_not_found');
  end if;
  if v_room.status <> 'waiting' then
    return jsonb_build_object('ok', false, 'reason', 'already_started');
  end if;

  select exists(select 1 from players where room_id = p_room_id and user_id = auth.uid() and is_host)
  into v_is_host;
  if not v_is_host then
    return jsonb_build_object('ok', false, 'reason', 'not_host');
  end if;

  select count(*) into v_player_count from players where room_id = p_room_id;
  if v_player_count < 2 then
    return jsonb_build_object('ok', false, 'reason', 'need_more_players');
  end if;

  v_word := pick_starter_word(v_room.dictionary_id);
  v_word_len := length(v_word);

  for r in select id from players where room_id = p_room_id loop
    update players
    set hand = deal_hand(v_room.dictionary_id)
    where id = r.id;

    update player_public
    set card_count = jsonb_array_length((select hand from players where id = r.id))
    where id = r.id;
  end loop;

  update rooms
  set status = 'playing',
      word = v_word,
      word_length = v_word_len,
      started_at = now(),
      ends_at = now() + make_interval(secs => v_room.duration_seconds)
  where id = p_room_id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function check_timeout(p_room_id uuid) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
begin
  select * into v_room from rooms where id = p_room_id for update;
  if v_room.status = 'playing' and now() >= v_room.ends_at then
    update rooms set status = 'timeout', ended_at = now() where id = p_room_id;
    return jsonb_build_object('ok', true, 'timed_out', true);
  end if;
  return jsonb_build_object('ok', true, 'timed_out', false);
end;
$$;

create or replace function attempt_move(
  p_room_id uuid,
  p_move_type text,
  p_card_id text,
  p_slot_index int default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player_id uuid;
  v_hand jsonb;
  v_room rooms%rowtype;
  v_card jsonb;
  v_next_word text;
  v_ok boolean;
  v_new_hand jsonb;
  v_new_letter text;
  v_frozen_until timestamptz;
begin
  select id, hand into v_player_id, v_hand
  from players where room_id = p_room_id and user_id = auth.uid();
  if v_player_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_in_room');
  end if;

  -- lock the room row: serializes concurrent moves on the same room so two
  -- simultaneous plays can never both apply against a stale word.
  select * into v_room from rooms where id = p_room_id for update;
  if v_room.status <> 'playing' then
    return jsonb_build_object('ok', false, 'reason', 'not_playing');
  end if;
  if now() >= v_room.ends_at then
    update rooms set status = 'timeout', ended_at = now() where id = p_room_id;
    return jsonb_build_object('ok', false, 'reason', 'timed_out');
  end if;

  select elem into v_card
  from jsonb_array_elements(v_hand) elem
  where elem->>'id' = p_card_id
  limit 1;
  if v_card is null then
    return jsonb_build_object('ok', false, 'reason', 'card_not_in_hand');
  end if;

  if p_move_type = 'place_letter' then
    if p_slot_index is null or p_slot_index < 0 or p_slot_index >= v_room.word_length then
      return jsonb_build_object('ok', false, 'reason', 'bad_slot');
    end if;
    v_frozen_until := (v_room.frozen ->> p_slot_index::text)::timestamptz;
    if v_frozen_until is not null and v_frozen_until > now() then
      return jsonb_build_object('ok', false, 'reason', 'frozen');
    end if;

    v_next_word := overlay(v_room.word placing (v_card->>'letter') from p_slot_index + 1 for 1);
    if v_next_word = v_room.word then
      return jsonb_build_object('ok', false, 'reason', 'same_word');
    end if;

    select exists(
      select 1 from words
      where dictionary_id = v_room.dictionary_id and length = v_room.word_length and word = v_next_word
    ) into v_ok;
    if not v_ok then
      insert into moves (room_id, player_id, type, payload, accepted)
      values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id, 'slot', p_slot_index), false);
      return jsonb_build_object('ok', false, 'reason', 'not_a_word');
    end if;

    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e
    where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms set word = v_next_word where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id, 'slot', p_slot_index), true);

    if jsonb_array_length(v_new_hand) = 0 then
      update rooms set status = 'won', winner_player_id = v_player_id, ended_at = now() where id = p_room_id;
    end if;

    return jsonb_build_object('ok', true, 'word', v_next_word);

  elsif p_move_type = 'place_expand' then
    if v_room.word_length <> 4 then
      return jsonb_build_object('ok', false, 'reason', 'cannot_expand');
    end if;
    v_next_word := v_room.word || (v_card->>'letter');
    select exists(
      select 1 from words where dictionary_id = v_room.dictionary_id and length = 5 and word = v_next_word
    ) into v_ok;
    if not v_ok then
      insert into moves (room_id, player_id, type, payload, accepted)
      values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), false);
      return jsonb_build_object('ok', false, 'reason', 'not_a_word');
    end if;

    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e
    where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms set word = v_next_word, word_length = 5 where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), true);

    if jsonb_array_length(v_new_hand) = 0 then
      update rooms set status = 'won', winner_player_id = v_player_id, ended_at = now() where id = p_room_id;
    end if;

    return jsonb_build_object('ok', true, 'word', v_next_word);

  elsif p_move_type = 'freeze' then
    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e
    where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms
    set frozen = frozen || jsonb_build_object(
      (floor(random() * v_room.word_length))::int::text,
      (now() + interval '5 seconds')::text
    )
    where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);

    if jsonb_array_length(v_new_hand) = 0 then
      update rooms set status = 'won', winner_player_id = v_player_id, ended_at = now() where id = p_room_id;
    end if;
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'chaos' then
    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e
    where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb)
      || jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter())
      || jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter());

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'draw' then
    v_new_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter()
    );
    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'swap' then
    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e
    where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb)
      || jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter());

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms set ends_at = greatest(now() + interval '1 second', ends_at - interval '3 seconds') where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), true);
    return jsonb_build_object('ok', true);

  else
    return jsonb_build_object('ok', false, 'reason', 'unknown_move_type');
  end if;
end;
$$;

-- ---------- Realtime ----------

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table player_public;

-- ---------- Explicit execute grants (belt-and-suspenders) ----------

grant execute on function create_room(text, int, text) to authenticated;
grant execute on function join_room(text, text) to authenticated;
grant execute on function start_game(uuid) to authenticated;
grant execute on function check_timeout(uuid) to authenticated;
grant execute on function attempt_move(uuid, text, text, int) to authenticated;
