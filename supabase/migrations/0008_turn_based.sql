-- Turn-based multiplayer.
--
--   * Players act in seat order instead of racing simultaneously.
--   * Each player owns a personal clock that only runs on their turn.
--   * A wrong guess costs clock time; in Endless (no clock) it ends the turn.
--   * Running out of clock eliminates you into spectating, where you can
--     see every hand.
--   * leave_room actually removes you, which it never did before: leaving a
--     room you'd created left your row behind and you'd still be sitting
--     there when your friend joined.
--
-- Run after 0007_endless_and_rescue.sql. Safe to re-run.

-- ---------- Schema ----------

alter table rooms
  add column if not exists current_turn_player_id uuid,
  add column if not exists turn_started_at timestamptz,
  add column if not exists turn_number int not null default 0,
  -- The slot last changed, so every client can highlight it in the mover's
  -- colour rather than everyone guessing what just happened.
  add column if not exists last_move_slot smallint,
  add column if not exists last_move_player_id uuid;

alter table players
  add column if not exists seat int,
  -- null means Endless: no clock, and nothing to run out of.
  add column if not exists time_left_ms int,
  add column if not exists eliminated boolean not null default false;

alter table player_public
  add column if not exists seat int,
  add column if not exists time_left_ms int,
  add column if not exists eliminated boolean not null default false;

-- ---------- Constants ----------

create or replace function wrong_guess_penalty_ms() returns int
  language sql immutable as $$ select 5000 $$;

-- How long a turn may sit untouched before anyone else may skip it. Only a
-- safety valve: in Endless there is no clock, so a player who closes their
-- tab mid-turn would otherwise hang the room permanently.
create or replace function stalled_turn_seconds() returns int
  language sql immutable as $$ select 90 $$;

-- ---------- Clocks ----------

-- A player's clock as it stands right now. Time only drains on your own
-- turn, so everyone else's value is simply what they banked.
create or replace function live_time_left_ms(p_player_id uuid) returns int
language sql
stable
as $$
  select case
    when p.time_left_ms is null then null
    when r.status = 'playing' and r.current_turn_player_id = p.id and r.turn_started_at is not null
      then greatest(0, p.time_left_ms
                       - (extract(epoch from (now() - r.turn_started_at)) * 1000)::int)
    else p.time_left_ms
  end
  from players p
  join rooms r on r.id = p.room_id
  where p.id = p_player_id;
$$;

-- Writes the running clock back down to the stored one. Called whenever a
-- turn ends, so the next turn starts from an honest number.
create or replace function bank_time(p_room_id uuid) returns void
language plpgsql
as $$
declare
  v_room rooms%rowtype;
  v_left int;
begin
  select * into v_room from rooms where id = p_room_id;
  if v_room.current_turn_player_id is null or v_room.turn_started_at is null then
    return;
  end if;

  v_left := live_time_left_ms(v_room.current_turn_player_id);
  if v_left is null then
    return;
  end if;

  update players set time_left_ms = v_left where id = v_room.current_turn_player_id;
  update player_public set time_left_ms = v_left where id = v_room.current_turn_player_id;
end;
$$;

-- ---------- Turn order ----------

create or replace function advance_turn(p_room_id uuid) returns void
language plpgsql
as $$
declare
  v_room rooms%rowtype;
  v_seat int;
  v_next uuid;
begin
  perform bank_time(p_room_id);

  select * into v_room from rooms where id = p_room_id;
  select seat into v_seat from players where id = v_room.current_turn_player_id;
  v_seat := coalesce(v_seat, -1);

  -- Next seat up, wrapping back to the lowest. Eliminated players are
  -- skipped, so a knocked-out seat never stalls the rotation.
  select id into v_next
  from players
  where room_id = p_room_id and not eliminated
  order by (case when seat > v_seat then 0 else 1 end), seat
  limit 1;

  update rooms
  set current_turn_player_id = v_next,
      turn_started_at = case when v_next is null then null else now() end,
      turn_number = turn_number + 1
  where id = p_room_id;
end;
$$;

create or replace function eliminate_player(p_player_id uuid) returns void
language plpgsql
as $$
begin
  update players set eliminated = true, time_left_ms = 0 where id = p_player_id;
  update player_public set eliminated = true, time_left_ms = 0 where id = p_player_id;
end;
$$;

-- Decides whether the room is over. Someone emptying their hand wins; so
-- does being the last player standing.
create or replace function settle_room(p_room_id uuid) returns void
language plpgsql
as $$
declare
  v_winner uuid;
  v_active int;
  v_total int;
begin
  select id into v_winner
  from players
  where room_id = p_room_id and not eliminated and jsonb_array_length(hand) = 0
  limit 1;

  if v_winner is not null then
    update rooms
    set status = 'won', winner_player_id = v_winner, ended_at = now(),
        current_turn_player_id = null, turn_started_at = null
    where id = p_room_id and status = 'playing';
    return;
  end if;

  select count(*) into v_active from players where room_id = p_room_id and not eliminated;
  select count(*) into v_total from players where room_id = p_room_id;

  if v_active = 0 then
    update rooms
    set status = 'timeout', ended_at = now(),
        current_turn_player_id = null, turn_started_at = null
    where id = p_room_id and status = 'playing';
  elsif v_active = 1 and v_total > 1 then
    select id into v_winner from players where room_id = p_room_id and not eliminated;
    update rooms
    set status = 'won', winner_player_id = v_winner, ended_at = now(),
        current_turn_player_id = null, turn_started_at = null
    where id = p_room_id and status = 'playing';
  end if;
end;
$$;

-- ---------- Spectating ----------

-- SECURITY DEFINER so the policy below can ask "is this viewer eliminated?"
-- without re-entering the players policy it is itself defining.
create or replace function is_spectator(p_room_id uuid) returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from players
    where room_id = p_room_id and user_id = auth.uid() and eliminated
  );
$$;

drop policy if exists "eliminated players can watch every hand" on players;
create policy "eliminated players can watch every hand" on players
  for select using (is_spectator(room_id));

-- ---------- Start ----------

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
  v_first uuid;
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

  -- Seats follow join order, and everyone gets their own clock.
  with ordered as (
    select id, (row_number() over (order by joined_at, id))::int - 1 as s
    from players where room_id = p_room_id
  )
  update players p
  set seat = o.s,
      eliminated = false,
      hand = deal_hand(v_room.dictionary_id),
      time_left_ms = case when v_room.duration_seconds > 0
                          then v_room.duration_seconds * 1000
                          else null end
  from ordered o
  where p.id = o.id;

  update player_public pp
  set seat = p.seat,
      eliminated = false,
      time_left_ms = p.time_left_ms,
      card_count = jsonb_array_length(p.hand)
  from players p
  where p.id = pp.id and p.room_id = p_room_id;

  select id into v_first from players where room_id = p_room_id order by seat limit 1;

  update rooms
  set status = 'playing',
      word = v_word,
      word_length = length(v_word),
      started_at = now(),
      -- Turn-based: the room has no shared clock at all, each player owns one.
      ends_at = null,
      current_turn_player_id = v_first,
      turn_started_at = now(),
      turn_number = 1,
      last_move_slot = null,
      last_move_player_id = null
  where id = p_room_id;

  for r in select id from players where room_id = p_room_id loop
    perform apply_rescue(p_room_id, r.id);
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Leaving ----------

create or replace function leave_room(p_room_id uuid) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
  v_player_id uuid;
  v_was_host boolean;
  v_next uuid;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  select id, is_host into v_player_id, v_was_host
  from players where room_id = p_room_id and user_id = auth.uid();
  if v_player_id is null then
    return jsonb_build_object('ok', true, 'reason', 'not_in_room');
  end if;

  select * into v_room from rooms where id = p_room_id for update;

  if v_room.status = 'waiting' then
    -- Nothing has started, so remove the seat entirely. This is the bug
    -- that left a host sitting in a room they had already walked out of.
    delete from player_public where id = v_player_id;
    delete from players where id = v_player_id;

    select id into v_next from players where room_id = p_room_id order by joined_at limit 1;
    if v_next is null then
      delete from rooms where id = p_room_id;
      return jsonb_build_object('ok', true, 'room_closed', true);
    end if;
    if v_was_host then
      update players set is_host = true where id = v_next;
      update player_public set is_host = true where id = v_next;
    end if;
    return jsonb_build_object('ok', true);
  end if;

  -- Mid-game, deleting the seat would renumber the turn order underneath
  -- everyone still playing, so quitting counts as being knocked out.
  perform eliminate_player(v_player_id);
  if v_room.current_turn_player_id = v_player_id then
    perform advance_turn(p_room_id);
  end if;
  perform settle_room(p_room_id);
  return jsonb_build_object('ok', true, 'eliminated', true);
end;
$$;

-- ---------- Clock enforcement ----------

create or replace function check_timeout(p_room_id uuid) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
  v_current uuid;
  v_left int;
begin
  select * into v_room from rooms where id = p_room_id for update;
  if v_room.status <> 'playing' then
    return jsonb_build_object('ok', true, 'timed_out', false);
  end if;

  v_current := v_room.current_turn_player_id;
  if v_current is null then
    perform settle_room(p_room_id);
    return jsonb_build_object('ok', true, 'timed_out', false);
  end if;

  v_left := live_time_left_ms(v_current);
  -- null = Endless. There is no clock to run out of.
  if v_left is null or v_left > 0 then
    return jsonb_build_object('ok', true, 'timed_out', false);
  end if;

  perform eliminate_player(v_current);
  perform advance_turn(p_room_id);
  perform settle_room(p_room_id);
  return jsonb_build_object('ok', true, 'timed_out', true, 'eliminated_player_id', v_current);
end;
$$;

-- Anyone may retire a turn that has sat untouched past the threshold. Without
-- this an Endless room whose active player closed their tab would never move
-- again, since there is no clock to knock them out.
create or replace function force_skip_turn(p_room_id uuid) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room rooms%rowtype;
begin
  select * into v_room from rooms where id = p_room_id for update;
  if v_room.status <> 'playing' or v_room.current_turn_player_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_playing');
  end if;
  if not exists (select 1 from players where room_id = p_room_id and user_id = auth.uid()) then
    return jsonb_build_object('ok', false, 'reason', 'not_in_room');
  end if;
  if now() - v_room.turn_started_at < make_interval(secs => stalled_turn_seconds()) then
    return jsonb_build_object('ok', false, 'reason', 'turn_not_stalled');
  end if;

  perform advance_turn(p_room_id);
  perform settle_room(p_room_id);
  return jsonb_build_object('ok', true);
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
  v_left int;
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

  if exists (select 1 from players where id = v_player_id and eliminated) then
    return jsonb_build_object('ok', false, 'reason', 'eliminated');
  end if;
  if v_room.current_turn_player_id <> v_player_id then
    return jsonb_build_object('ok', false, 'reason', 'not_your_turn');
  end if;

  v_endless := (select time_left_ms is null from players where id = v_player_id);

  -- Your own clock, checked on every action rather than only on a tick, so
  -- a move made a second too late can't sneak through.
  if not v_endless then
    v_left := live_time_left_ms(v_player_id);
    if v_left <= 0 then
      perform eliminate_player(v_player_id);
      perform advance_turn(p_room_id);
      perform settle_room(p_room_id);
      return jsonb_build_object('ok', false, 'reason', 'eliminated');
    end if;
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
      values (p_room_id, v_player_id, p_move_type,
              jsonb_build_object('card_id', p_card_id, 'slot', p_slot_index), false);

      -- A wrong guess costs you. With a clock that's seconds; in Endless
      -- there are none to take, so it costs you the turn instead.
      if v_endless then
        perform advance_turn(p_room_id);
        return jsonb_build_object('ok', false, 'reason', 'not_a_word', 'turn_skipped', true);
      end if;

      update players
      set time_left_ms = greatest(0, time_left_ms - wrong_guess_penalty_ms())
      where id = v_player_id;
      update player_public pp
      set time_left_ms = (select time_left_ms from players where id = pp.id)
      where pp.id = v_player_id;

      v_left := live_time_left_ms(v_player_id);
      if v_left <= 0 then
        perform eliminate_player(v_player_id);
        perform advance_turn(p_room_id);
        perform settle_room(p_room_id);
        return jsonb_build_object('ok', false, 'reason', 'not_a_word',
                                  'penalty_ms', wrong_guess_penalty_ms(), 'eliminated', true);
      end if;
      return jsonb_build_object('ok', false, 'reason', 'not_a_word',
                                'penalty_ms', wrong_guess_penalty_ms());
    end if;

    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb);

    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    update rooms
    set word = v_next_word,
        last_move_slot = p_slot_index,
        last_move_player_id = v_player_id
    where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type,
            jsonb_build_object('card_id', p_card_id, 'slot', p_slot_index), true);

    if jsonb_array_length(v_new_hand) = 0 then
      perform settle_room(p_room_id);
      return jsonb_build_object('ok', true, 'word', v_next_word, 'won', true);
    end if;

    -- The board is shared, so a play can strand anyone, not just the mover.
    for r in select id from players where room_id = p_room_id and not eliminated loop
      if r.id = v_player_id then
        v_rescue := apply_rescue(p_room_id, r.id);
      else
        perform apply_rescue(p_room_id, r.id);
      end if;
    end loop;

    perform advance_turn(p_room_id);
    perform settle_room(p_room_id);
    return jsonb_build_object('ok', true, 'word', v_next_word, 'rescue', v_rescue);

  elsif p_move_type = 'pass' then
    -- Voluntarily hand the turn on.
    perform advance_turn(p_room_id);
    perform settle_room(p_room_id);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'freeze' then
    if v_endless then
      return jsonb_build_object('ok', false, 'reason', 'no_timer');
    end if;
    -- Now that clocks are per-player, Freeze tops up your own.
    update players set time_left_ms = time_left_ms + 8000 where id = v_player_id;
    update player_public pp set time_left_ms = (select time_left_ms from players where id = pp.id)
    where pp.id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'chaos' then
    select jsonb_agg(
             case when ord <= 4
               then jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter())
               else elem end
             order by ord)
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
      perform settle_room(p_room_id);
      return jsonb_build_object('ok', true, 'won', true);
    end if;
    v_rescue := apply_rescue(p_room_id, v_player_id);
    return jsonb_build_object('ok', true, 'rescue', v_rescue);

  elsif p_move_type = 'draw' then
    if jsonb_array_length(v_hand) >= max_hand() then
      return jsonb_build_object('ok', false, 'reason', 'hand_full');
    end if;
    v_new_hand := v_hand || jsonb_build_object(
      'id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter());
    update players set hand = v_new_hand where id = v_player_id;
    update player_public set card_count = jsonb_array_length(v_new_hand) where id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'swap' then
    if v_endless then
      return jsonb_build_object('ok', false, 'reason', 'no_timer');
    end if;
    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
    v_new_hand := coalesce(v_new_hand, '[]'::jsonb)
      || jsonb_build_object('id', 'l-' || gen_random_uuid()::text, 'kind', 'letter', 'letter', random_letter());

    update players set hand = v_new_hand,
                       time_left_ms = greatest(0, time_left_ms - 3000)
    where id = v_player_id;
    update player_public pp
    set card_count = (select jsonb_array_length(hand) from players where id = pp.id),
        time_left_ms = (select time_left_ms from players where id = pp.id)
    where pp.id = v_player_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), true);
    v_rescue := apply_rescue(p_room_id, v_player_id);
    return jsonb_build_object('ok', true, 'rescue', v_rescue);

  else
    return jsonb_build_object('ok', false, 'reason', 'unknown_move_type');
  end if;
end;
$$;

grant execute on function start_game(uuid) to authenticated;
grant execute on function check_timeout(uuid) to authenticated;
grant execute on function attempt_move(uuid, text, text, int) to authenticated;
grant execute on function leave_room(uuid) to authenticated;
grant execute on function force_skip_turn(uuid) to authenticated;
grant execute on function is_spectator(uuid) to authenticated;
grant execute on function live_time_left_ms(uuid) to authenticated;
