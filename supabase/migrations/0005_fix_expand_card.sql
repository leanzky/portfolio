-- Fixes the Expand card in multiplayer.
--
-- It was dealt with ONE fixed random letter, and that exact letter only
-- forms a real word about 5% of the time — so the card looked broken.
-- The letter is now chosen at play time from whatever actually works,
-- matching the single-player client. Run after 0004_expand_dictionary.sql.

-- Deal Expand with no pre-assigned letter.
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
      'id', 'a-' || gen_random_uuid()::text, 'kind', 'action', 'action', 'expand'
    );
  end if;

  select jsonb_agg(elem order by random()) into v_hand
  from jsonb_array_elements(v_hand) elem;

  return v_hand;
end;
$$;

-- Resolve the Expand letter against the live word instead of the card.
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
  if now() >= v_room.ends_at then
    update rooms set status = 'timeout', ended_at = now() where id = p_room_id;
    return jsonb_build_object('ok', false, 'reason', 'timed_out');
  end if;

  select elem into v_card
  from jsonb_array_elements(v_hand) elem
  where elem->>'id' = p_card_id
  limit 1;
  if v_card is null and p_move_type <> 'draw' then
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
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
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

    -- Any 5-letter word in this dictionary that is the current word plus
    -- one more character. Chosen now, not baked into the card.
    select w.word into v_next_word
    from words w
    where w.dictionary_id = v_room.dictionary_id
      and w.length = 5
      and w.word like (v_room.word || '_')
    order by random()
    limit 1;

    if v_next_word is null then
      insert into moves (room_id, player_id, type, payload, accepted)
      values (p_room_id, v_player_id, p_move_type, jsonb_build_object('card_id', p_card_id), false);
      return jsonb_build_object('ok', false, 'reason', 'not_a_word');
    end if;

    select jsonb_agg(e) into v_new_hand
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
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
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
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
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
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
    from jsonb_array_elements(v_hand) e where e->>'id' <> p_card_id;
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

grant execute on function attempt_move(uuid, text, text, int) to authenticated;
