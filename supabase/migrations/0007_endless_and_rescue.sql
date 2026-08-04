-- Brings multiplayer in line with the solo rules:
--   * Endless mode: duration_seconds = 0 means no clock at all, so emptying
--     your hand is the only way the game can end.
--   * 12-card opening hand with a hard ceiling of 15.
--   * Automatic no-moves rescue: a player with no legal play has their hand
--     redrawn and takes 2 extra cards for it.
--
-- The rescue is not optional for Endless. With a timer, a stuck player just
-- loses when the clock runs out; without one, a stuck player would sit there
-- forever and the room could never reach a terminal state.
--
-- Run after 0006_powerup_rework.sql. Safe to re-run.

-- ---------- Constants, in one place ----------
-- Kept as functions so there's a single definition to change, matching
-- HAND_SIZE / MAX_HAND / RESCUE_CARDS in lib/scrabble-slam/engine.ts.

create or replace function hand_size() returns int language sql immutable as $$ select 12 $$;
create or replace function max_hand() returns int language sql immutable as $$ select 15 $$;
create or replace function rescue_cards() returns int language sql immutable as $$ select 2 $$;

-- ---------- Move detection ----------

-- Does any card in this hand make a different, valid word?
create or replace function has_move(
  p_word text,
  p_hand jsonb,
  p_dictionary_id text,
  p_word_length int
) returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from jsonb_array_elements(p_hand) as c(elem)
    cross join generate_series(0, p_word_length - 1) as s(slot)
    join words w
      on w.dictionary_id = p_dictionary_id
     and w.length = p_word_length
     and w.word = overlay(p_word placing (c.elem->>'letter') from s.slot + 1 for 1)
    where overlay(p_word placing (c.elem->>'letter') from s.slot + 1 for 1) <> p_word
  );
$$;

-- Can this word be advanced AT ALL, by any letter, regardless of hand?
-- Roughly 30% of 6-letter words fail this (2% of 4-letter ones): no single
-- letter change makes another word. No hand can play them.
create or replace function word_has_successor(
  p_word text,
  p_dictionary_id text,
  p_word_length int
) returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from generate_series(97, 122) as a(code)
    cross join generate_series(0, p_word_length - 1) as s(slot)
    join words w
      on w.dictionary_id = p_dictionary_id
     and w.length = p_word_length
     and w.word = overlay(p_word placing chr(a.code) from s.slot + 1 for 1)
    where overlay(p_word placing chr(a.code) from s.slot + 1 for 1) <> p_word
  );
$$;

-- ---------- Starter words are never dead ends ----------

create or replace function pick_starter_word(p_dictionary_id text, p_length int)
returns text
language plpgsql
volatile
as $$
declare
  v_word text;
  i int;
begin
  for i in 1..40 loop
    select word into v_word
    from words
    where dictionary_id = p_dictionary_id and length = p_length and is_starter
    order by random()
    limit 1;

    if v_word is null then
      return null;
    end if;
    if word_has_successor(v_word, p_dictionary_id, p_length) then
      return v_word;
    end if;
  end loop;
  -- Exhausted the retries: return whatever we last drew rather than null,
  -- so the room still starts. The rescue below will deal with it.
  return v_word;
end;
$$;

-- ---------- 12-card opening hand ----------

create or replace function deal_hand(p_dictionary_id text) returns jsonb
language plpgsql
volatile
as $$
declare
  v_hand jsonb := '[]'::jsonb;
  v_hand_size int := hand_size();
  v_min_vowels int;
  v_vowels text[] := array['a','e','i','o','u'];
  i int;
begin
  v_min_vowels := ceil(v_hand_size / 3.0);

  for i in 1..v_min_vowels loop
    v_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text,
      'kind', 'letter',
      'letter', v_vowels[(floor(random() * 5) + 1)::int]
    );
  end loop;

  for i in 1..(v_hand_size - v_min_vowels) loop
    v_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text,
      'kind', 'letter',
      'letter', random_letter()
    );
  end loop;

  select jsonb_agg(elem order by random()) into v_hand
  from jsonb_array_elements(v_hand) elem;

  return v_hand;
end;
$$;

-- ---------- The rescue ----------

-- Returns {rescued, hand, added, word}. `word` is non-null only when the
-- BOARD was the dead end and had to be replaced, which costs no cards
-- because no hand could have played it.
create or replace function rescue_if_stuck(
  p_word text,
  p_hand jsonb,
  p_dictionary_id text,
  p_word_length int
) returns jsonb
language plpgsql
volatile
as $$
declare
  v_hand jsonb;
  v_word text := p_word;
  v_new_word text := null;
  v_grow int;
  i int;
begin
  if p_hand is null or jsonb_array_length(p_hand) = 0 then
    return jsonb_build_object('rescued', false);
  end if;
  if has_move(p_word, p_hand, p_dictionary_id, p_word_length) then
    return jsonb_build_object('rescued', false);
  end if;

  if word_has_successor(p_word, p_dictionary_id, p_word_length) then
    v_grow := least(rescue_cards(), greatest(0, max_hand() - jsonb_array_length(p_hand)));
  else
    v_new_word := pick_starter_word(p_dictionary_id, p_word_length);
    v_word := coalesce(v_new_word, p_word);
    v_grow := 0;
  end if;

  -- Redraw, don't reorder. Reordering is cosmetic: the letters that
  -- couldn't play still can't, and dead letters would pile up until every
  -- turn needed a rescue.
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', 'l-' || gen_random_uuid()::text,
           'kind', 'letter',
           'letter', random_letter()
         )), '[]'::jsonb)
  into v_hand
  from jsonb_array_elements(p_hand);

  for i in 1..v_grow loop
    v_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter()
    );
  end loop;

  -- Bounded, so a pathological word list can't spin forever. In practice
  -- the redraw alone almost always lands a move.
  for i in 1..60 loop
    exit when has_move(v_word, v_hand, p_dictionary_id, p_word_length);
    select jsonb_agg(
             case when ord <= 2
               then jsonb_build_object('id', 'l-' || gen_random_uuid()::text,
                                       'kind', 'letter', 'letter', random_letter())
               else elem end
             order by ord)
    into v_hand
    from (
      select elem, row_number() over (order by random()) as ord
      from jsonb_array_elements(v_hand) elem
    ) t;
  end loop;

  return jsonb_build_object(
    'rescued', true, 'hand', v_hand, 'added', v_grow, 'word', v_new_word
  );
end;
$$;

-- Applies a rescue to one player, writing the hand (and the shared board
-- word, if that was the dead end) back to the tables.
create or replace function apply_rescue(p_room_id uuid, p_player_id uuid)
returns jsonb
language plpgsql
volatile
as $$
declare
  v_room rooms%rowtype;
  v_hand jsonb;
  v_res jsonb;
begin
  select * into v_room from rooms where id = p_room_id;
  if v_room.status <> 'playing' then
    return jsonb_build_object('rescued', false);
  end if;

  select hand into v_hand from players where id = p_player_id;
  v_res := rescue_if_stuck(v_room.word, v_hand, v_room.dictionary_id, v_room.word_length);
  if not coalesce((v_res->>'rescued')::boolean, false) then
    return v_res;
  end if;

  update players set hand = v_res->'hand' where id = p_player_id;
  update player_public set card_count = jsonb_array_length(v_res->'hand') where id = p_player_id;
  if v_res->>'word' is not null then
    update rooms set word = v_res->>'word' where id = p_room_id;
  end if;
  return v_res;
end;
$$;

-- ---------- Endless: no clock ----------

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

  v_word := pick_starter_word(v_room.dictionary_id, v_room.start_length);
  if v_word is null then
    return jsonb_build_object('ok', false, 'reason', 'no_starter_word');
  end if;

  for r in select id from players where room_id = p_room_id loop
    update players set hand = deal_hand(v_room.dictionary_id) where id = r.id;
    update player_public
    set card_count = jsonb_array_length((select hand from players where id = r.id))
    where id = r.id;
  end loop;

  update rooms
  set status = 'playing',
      word = v_word,
      word_length = length(v_word),
      started_at = now(),
      -- duration 0 = Endless: no end time at all.
      ends_at = case
                  when v_room.duration_seconds > 0
                    then now() + make_interval(secs => v_room.duration_seconds)
                  else null
                end
  where id = p_room_id;

  -- A dead opening hand is possible, so every player gets checked.
  for r in select id from players where room_id = p_room_id loop
    perform apply_rescue(p_room_id, r.id);
  end loop;

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
  -- ends_at is null in Endless, and null comparisons would silently never
  -- fire; being explicit says the intent out loud.
  if v_room.status = 'playing'
     and v_room.ends_at is not null
     and now() >= v_room.ends_at then
    update rooms set status = 'timeout', ended_at = now() where id = p_room_id;
    return jsonb_build_object('ok', true, 'timed_out', true);
  end if;
  return jsonb_build_object('ok', true, 'timed_out', false);
end;
$$;

-- ---------- Moves ----------

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
  v_frozen_until timestamptz;
  v_keep int;
  v_endless boolean;
  v_rescue jsonb := jsonb_build_object('rescued', false);
  r record;
begin
  select id, hand into v_player_id, v_hand
  from players where room_id = p_room_id and user_id = auth.uid();
  if v_player_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_in_room');
  end if;

  select * into v_room from rooms where id = p_room_id for update;
  if v_room.status <> 'playing' then
    return jsonb_build_object('ok', false, 'reason', 'not_playing');
  end if;

  v_endless := v_room.ends_at is null;
  if not v_endless and now() >= v_room.ends_at then
    update rooms set status = 'timeout', ended_at = now() where id = p_room_id;
    return jsonb_build_object('ok', false, 'reason', 'timed_out');
  end if;

  if p_move_type = 'place_letter' then
    select elem into v_card
    from jsonb_array_elements(v_hand) elem
    where elem->>'id' = p_card_id
    limit 1;
    if v_card is null then
      return jsonb_build_object('ok', false, 'reason', 'card_not_in_hand');
    end if;

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
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms set word = v_next_word where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id, 'slot', p_slot_index), true);

    if jsonb_array_length(v_new_hand) = 0 then
      update rooms set status = 'won', winner_player_id = v_player_id, ended_at = now() where id = p_room_id;
      return jsonb_build_object('ok', true, 'word', v_next_word);
    end if;

    -- The board word is shared, so a play can strand the OPPONENT just as
    -- easily as the mover. Everyone gets checked, or an Endless room could
    -- sit deadlocked waiting on a player who has no move to make.
    for r in select id from players where room_id = p_room_id loop
      if r.id = v_player_id then
        v_rescue := apply_rescue(p_room_id, r.id);
      else
        perform apply_rescue(p_room_id, r.id);
      end if;
    end loop;

    return jsonb_build_object('ok', true, 'word', v_next_word, 'rescue', v_rescue);

  elsif p_move_type = 'freeze' then
    if v_endless then
      return jsonb_build_object('ok', false, 'reason', 'no_timer');
    end if;
    update rooms set ends_at = ends_at + interval '8 seconds' where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'chaos' then
    select jsonb_agg(
             case when ord <= 4
               then jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter())
               else elem end
             order by ord
           )
    into v_new_hand
    from (
      select elem, row_number() over (order by random()) as ord
      from jsonb_array_elements(v_hand) elem
    ) shuffled;
    v_new_hand := coalesce(v_new_hand, v_hand);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    v_rescue := apply_rescue(p_room_id, v_player_id);
    return jsonb_build_object('ok', true, 'rescue', v_rescue);

  elsif p_move_type = 'purge' then
    v_keep := greatest(0, jsonb_array_length(v_hand) - 2);
    select coalesce(jsonb_agg(elem order by ord), '[]'::jsonb) into v_new_hand
    from (
      select elem, row_number() over () as ord
      from jsonb_array_elements(v_hand) elem
    ) t
    where ord <= v_keep;

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);

    if jsonb_array_length(v_new_hand) = 0 then
      update rooms set status = 'won', winner_player_id = v_player_id, ended_at = now() where id = p_room_id;
      return jsonb_build_object('ok', true);
    end if;
    v_rescue := apply_rescue(p_room_id, v_player_id);
    return jsonb_build_object('ok', true, 'rescue', v_rescue);

  elsif p_move_type = 'draw' then
    if jsonb_array_length(v_hand) >= max_hand() then
      return jsonb_build_object('ok', false, 'reason', 'hand_full');
    end if;
    v_new_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter()
    );
    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'swap' then
    -- Swapping is paid for in seconds, so Endless has no price for it.
    if v_endless then
      return jsonb_build_object('ok', false, 'reason', 'no_timer');
    end if;
    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb)
      || jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter());

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms set ends_at = greatest(now() + interval '1 second', ends_at - interval '3 seconds') where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), true);
    v_rescue := apply_rescue(p_room_id, v_player_id);
    return jsonb_build_object('ok', true, 'rescue', v_rescue);

  else
    return jsonb_build_object('ok', false, 'reason', 'unknown_move_type');
  end if;
end;
$$;

grant execute on function pick_starter_word(text, int) to authenticated;
grant execute on function start_game(uuid) to authenticated;
grant execute on function check_timeout(uuid) to authenticated;
grant execute on function attempt_move(uuid, text, text, int) to authenticated;
