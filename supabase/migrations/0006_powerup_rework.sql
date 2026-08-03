-- Reworks multiplayer to match the redesigned game:
--   * hands are letters only (abilities live on a side rail, not in hand)
--   * Expand is gone entirely
--   * word length (4/5/6) is chosen per room instead of implied by the
--     dictionary, so the 'hardcore' dictionary is no longer needed
--   * new abilities: Freeze (+8s on the clock) and Purge (burn 2 cards),
--     alongside the existing Chaos (reroll 4 letters)
-- Run after 0005_fix_expand_card.sql.

-- Rooms remember the chosen length; existing rows keep whatever they had.
alter table rooms add column if not exists start_length smallint not null default 4;
alter table rooms drop constraint if exists rooms_status_check;
alter table rooms add constraint rooms_status_check
  check (status in ('waiting', 'playing', 'won', 'timeout'));

-- ---------- letters-only hands ----------

create or replace function deal_hand(p_dictionary_id text) returns jsonb
language plpgsql
volatile
as $$
declare
  v_hand jsonb := '[]'::jsonb;
  v_hand_size int := 16;
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

-- ---------- starter word for an explicit length ----------

create or replace function pick_starter_word(p_dictionary_id text, p_length int)
returns text
language sql
volatile
as $$
  select word from words
  where dictionary_id = p_dictionary_id
    and length = p_length
    and is_starter
  order by random()
  limit 1;
$$;

-- ---------- room creation carries the length ----------

create or replace function create_room(
  p_dictionary_id text,
  p_duration_seconds int,
  p_name text,
  p_start_length int default 4
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

  insert into rooms (code, dictionary_id, duration_seconds, start_length)
  values (v_code, p_dictionary_id, p_duration_seconds, p_start_length)
  returning id into v_room_id;

  insert into players (room_id, user_id, name, is_host)
  values (v_room_id, auth.uid(), p_name, true)
  returning id into v_player_id;

  insert into player_public (id, room_id, name, is_host, card_count)
  values (v_player_id, v_room_id, p_name, true, 0);

  return jsonb_build_object('ok', true, 'room_id', v_room_id, 'code', v_code, 'player_id', v_player_id);
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
      ends_at = now() + make_interval(secs => v_room.duration_seconds)
  where id = p_room_id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- moves: no expand, plus freeze/purge abilities ----------

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
  i int;
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
    end if;
    return jsonb_build_object('ok', true, 'word', v_next_word);

  elsif p_move_type = 'freeze' then
    -- Ability: put 8 seconds back on the shared clock.
    update rooms set ends_at = ends_at + interval '8 seconds' where id = p_room_id;
    insert into moves (room_id, player_id, type, payload, accepted)
    values (p_room_id, v_player_id, p_move_type, '{}'::jsonb, true);
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'chaos' then
    -- Ability: reroll 4 random cards, hand size unchanged.
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
    return jsonb_build_object('ok', true);

  elsif p_move_type = 'purge' then
    -- Ability: burn 2 cards outright.
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
    end if;
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

-- The 5-letter starters were never flagged (length was implied by the
-- dictionary before); make sure every playable length has a starter pool.
update words w set is_starter = true
where w.dictionary_id = 'tech';

grant execute on function create_room(text, int, text, int) to authenticated;
grant execute on function pick_starter_word(text, int) to authenticated;
grant execute on function start_game(uuid) to authenticated;
grant execute on function attempt_move(uuid, text, text, int) to authenticated;

-- Flag the 5-letter starter pool (0004 only covered lengths 4 and 6,
-- because length used to be implied by the dictionary).

update words set is_starter = true
 where dictionary_id = 'standard' and length = 5
   and word = any(ARRAY['abide','acres','after','aging','aided','aides','aimed','aired','alive','alley','allow','alloy','alone','alter','ample','apply','areas','arise','aside','babes','backs','bacon','badge','badly','baked','baker','balls','bands','banks','baron','basal','based','bases','basic','basil','basin','basis','batch','bates','baths','beach','beads','beams','beans','beard','bears','beast','beats','beech','beers','began','begun','belle','bells','belly','belts','bench','benny','berry','biker','bikes','bills','billy','binds','bingo','birds','birth','bites','black','blade','blame','bland','blank','blast','blaze','bleed','blend','blind','blink','block','blond','blood','bloom','blown','blows','blues','blunt','blush','board','boats','bobby','boing','bolts','bombs','bonds','bones','bonus','books','booth','boots','booty','bored','bound','bowel','bowls','boxed','boxer','boxes','brace','brain','brake','brand','brass','brave','bread','break','breed','brick','bride','bring','brock','brook','brown','brush','bucks','buddy','buffy','buggy','built','bulbs','bulls','bunch','bunny','burns','burst','buses','busty','bytes','cable','cafes','cages','cakes','calls','camps','candy','canon','carbs','cards','cared','cares','carry','carts','cases','casts','catch','cater','caves','cease','cello','cells','cents','champ','chaos','charm','chars','chart','chase','chats','cheat','check','cheek','cheer','chefs','chess','chest','chick','chico','child','chile','chili','chill','china','chips','chose','chuck','chunk','cider','cited','cites','clamp','clash','class','clean','clear','click','clips','clock','clone','close','clown','clubs','clues','coach','coast','coats','cocos','codec','coded','codes','coins','colon','colts','combo','comes','comet','comic','condo','congo','cooks','coral','cords','cores','corps','costs','couch','cough','count','cover','crack','craft','crane','crank','crash','crate','crawl','cream','creed','creek','creep','crest','crews','cried','cries','crime','crops','cross','crown','cruel','crush','crust','cubes','cured','curly','curry','curse','curve','daddy','daily','dairy','dance','darts','dated','dates','deals','death','debut','decal','decay','decks','deeds','delay','demon','demos','dense','deter','diner','disks','ditch','diver','dodge','doing','dolls','dolly','doors','doses','dough','downs','dozen','draft','drain','drank','drawn','draws','dread','dream','dress','dried','drill','drink','drops','drove','drugs','drums','drunk','dryer','ducks','dukes','dummy','dunes','dusty','dutch','dying','eager','earns','eater','eight','elder','elite','enter','erect','fable','faced','faces','facts','faded','fails','faint','fairs','fairy','fakes','falls','fares','farms','fatty','fault','faxes','fears','feast','feeds','feels','ferry','fetal','fetch','fever','fewer','fiber','field','fifth','fight','filed','files','fills','films','filth','finch','finds','fined','fines','fired','fires','firms','fixed','fixes','flags','flame','flare','flash','flats','flaws','fleet','flesh','flick','flies','flint','float','flock','floor','flown','flows','flush','flute','focal','focus','folds','folks','fonts','foods','fools','force','forge','forks','forms','forte','forth','forty','found','frank','freak','freed','fried','fries','frogs','frost','fudge','fuels','fully','funds','funky','funny','furry','gains','gamer','games','gamma','gangs','gases','gates','gears','geeks','genes','genus','gifts','girls','given','gives','gland','glass','glide','globe','gloss','glove','goals','goats','goods','goose','gorge','gowns','grabs','grace','grade','grain','grams','grand','grant','grape','grass','grave','great','greed','greek','green','greet','grill','grips','groom','gross','grove','grown','grows','guide','guild','guilt','hacks','hairy','halls','hands','handy','hangs','happy','hardy','harry','hatch','hated','hates','haven','hawks','hazel','heads','heard','hears','heart','heath','hedge','heels','hello','helps','hence','herbs','hicks','hides','hills','hinge','hints','hired','hires','hitch','hobby','holds','holes','holly','homer','homes','honey','hoods','hooks','hoops','hoped','hopes','horns','horse','hosts','hound','hours','house','hunks','hurry','hurts','husky','inter','ionic','jacks','jeans','jelly','jerry','joins','joint','jokes','jolly','jones','judge','jumps','keeps','kelly','kerry','kicks','kills','kinds','kings','kinky','kitty','knobs','knots','knows','kraft','label','lacks','lakes','lamps','lance','lands','lanes','large','laser','lasts','latch','later','layer','leads','leaks','lease','least','leave','level','lever','liens','lifts','light','liked','likes','limbs','lined','linen','liner','lines','links','lions','lists','liter','lived','liver','lives','loads','loans','lobby','local','locks','locus','lodge','logan','logos','looks','loops','loose','lords','loser','loses','louis','loved','lover','loves','lower','loyal','lucky','lunch','lungs','lying','mails','mains','maker','makes','males','malls','mango','mania','manor','march','maria','marks','marry','masks','match','mates','matte','mayor','meals','means','meats','medal','meets','menus','merge','merry','messy','metal','meter','might','mikes','miles','mills','minds','miner','mines','minus','missy','misty','mixed','mixer','mixes','modal','model','modes','moist','molly','mommy','money','monks','monte','moody','moose','moral','morse','motel','motto','mound','mount','mouse','mouth','moved','mover','moves','muddy','mummy','myths','nails','naked','named','names','nancy','nanny','nasal','nasty','natal','naval','needs','needy','nelly','nerve','never','newer','night','nodes','noise','norms','noted','notes','nudes','older','other','otter','outer','ovens','owing','paced','packs','paddy','pager','pages','pains','paint','pairs','palms','pants','panty','paper','paris','parks','parse','parts','party','pasta','paste','patch','paths','patty','pause','paved','peace','peach','peaks','pedal','peers','penny','perry','pests','peter','petty','phase','phone','picks','piles','pills','pilot','pinch','pines','piper','pipes','pitch','pivot','place','plain','plane','plans','plant','plate','plays','plots','plump','plush','poets','point','poker','polar','poles','polls','ponds','pools','poppy','porch','ports','posed','poses','posts','pouch','pound','power','press','price','pride','prime','prize','probe','promo','prone','props','prose','prove','puffy','pulls','pumps','punch','puppy','purse','quark','quart','quiet','quilt','quite','quote','racer','races','racks','radio','rails','rains','rally','ramps','range','ranks','rants','rated','rates','raven','reach','reads','ready','reels','relay','renal','rents','resin','rests','retro','rider','rides','right','rings','risen','rises','risks','river','roach','roads','roast','rocks','roger','roles','rolls','roman','rooms','roots','ropes','roses','rouge','rough','round','route','rover','ruins','ruled','ruler','rules','rural','rusty','sacks','sadly','safer','saint','sales','sally','salts','sands','sandy','satin','saved','saver','saves','scale','scams','scans','scare','scarf','scars','scary','scent','scoop','scope','score','scots','scout','scrap','seals','sears','seats','seeds','seeks','seems','sells','sends','sense','serum','serve','setup','sewer','shack','shade','shady','shake','shall','shalt','shame','shape','share','shark','sharp','shave','shawn','shear','sheds','sheep','sheer','sheet','shell','shift','shine','shiny','ships','shire','shirt','shock','shoes','shook','shoot','shops','shore','short','shots','shout','shown','shows','sided','sides','siege','sight','silky','silly','since','sings','sinks','sinus','sites','sized','sizes','skate','skies','skill','skins','skull','slack','slang','slash','slate','slave','sleep','slice','slick','slide','sling','slips','slope','slots','small','smart','smash','smell','smoke','snack','snake','snoop','soaps','sober','socks','soils','solar','songs','sonic','sorts','souls','sound','soups','south','space','spank','spans','spare','spark','speak','spear','speed','spell','spend','spent','spice','spicy','spies','spike','spill','spine','spite','spoke','spoon','sport','spots','spray','spurs','squad','stack','stage','stain','stake','stall','stamp','stand','stare','stark','stars','start','state','stats','stays','steak','steal','steam','steel','steep','steer','stein','stems','steps','stick','stiff','still','sting','stock','stoke','stole','stone','stony','stood','stool','stops','store','storm','story','stout','stove','strap','straw','stray','strip','stuck','studs','stuff','stunt','style','sucks','suite','suits','sunny','surge','swamp','swear','sweat','sweep','sweet','swell','swept','swing','swiss','sword','sworn','table','tails','taken','takes','tales','talks','tally','tammy','tango','tanks','tapes','tasks','taste','tasty','taxes','teach','teams','tears','tease','teens','tells','tempo','temps','tends','tense','tenth','tents','terms','terry','tests','texts','thank','theme','there','these','thick','thing','think','those','threw','throw','tides','tiger','tight','tiles','timed','timer','times','tired','tires','toast','token','tommy','toner','tones','tools','tooth','topic','torch','touch','tough','tours','towel','tower','towns','toxic','trace','track','tract','trail','train','trait','trans','traps','trays','tread','trees','tribe','trick','tried','tries','trips','truck','trump','trunk','trust','tubes','tummy','tumor','tuned','tuner','tunes','turks','turns','tweed','twins','tying','typed','types','units','unity','vague','value','valve','vases','vault','verse','vests','vines','viper','volts','voted','voter','votes','wacky','wages','waits','wales','walks','walls','wants','wards','warns','waste','watch','water','watts','waves','wears','weary','wedge','weeds','weeks','welch','wells','whale','while','white','whole','whose','wider','wight','wills','willy','winds','wines','wings','wired','wires','witch','witty','wives','women','woods','woody','words','works','worms','worry','worse','worst','would','wound','woven','wrist','write','wrong','yards','years','yeast','yours','yummy','zones']::text[]);

