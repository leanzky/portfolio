-- Meal calendar schema. Lives in the SAME Supabase project as Scrabble
-- Slam (same database, different feature) — run this in the SQL Editor
-- after the two scrabble-slam migrations. Needs the same "Anonymous
-- sign-ins" auth provider already enabled for the game.

create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  log_date date not null,
  category text not null
    check (category in ('1_meal', '2_meals', '3_meals', '4_meals', 'excessive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index meal_logs_user_date_idx on meal_logs (user_id, log_date);

alter table meal_logs enable row level security;

-- Each anonymous browser identity only ever sees and edits its own log —
-- same privacy pattern as a player's hand in the Scrabble Slam schema.
create policy "read own meal logs" on meal_logs
  for select using (user_id = auth.uid());

create policy "insert own meal logs" on meal_logs
  for insert with check (user_id = auth.uid());

create policy "update own meal logs" on meal_logs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "delete own meal logs" on meal_logs
  for delete using (user_id = auth.uid());

-- Keep updated_at current on every edit.
create or replace function set_meal_log_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger meal_logs_set_updated_at
  before update on meal_logs
  for each row
  execute function set_meal_log_updated_at();
