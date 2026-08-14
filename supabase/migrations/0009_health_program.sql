-- Health program schema. Replaces the meal_logs tracker at /calendar with a
-- daily check-in, weight/BP history, and progress photos.
--
-- Lives in the SAME Supabase project as everything else. Run in the SQL
-- Editor after 0003. Needs the "Anonymous sign-ins" auth provider that the
-- game already uses.
--
-- meal_logs is left in place: it holds real history and nothing here reads
-- it. Drop it yourself once you no longer want that data.

-- ---------------------------------------------------------------
-- Daily check-in: one row per person per day.
-- ---------------------------------------------------------------
create table health_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  log_date date not null,

  -- Vitals. All nullable: a day with only a walk logged is still a good day.
  weight_kg numeric(5, 1) check (weight_kg is null or weight_kg between 30 and 400),
  systolic int check (systolic is null or systolic between 60 and 300),
  diastolic int check (diastolic is null or diastolic between 30 and 200),
  pulse int check (pulse is null or pulse between 30 and 220),

  -- The five daily habits the program actually turns on.
  walk_minutes int not null default 0 check (walk_minutes between 0 and 600),
  strength_done boolean not null default false,
  meds_taken boolean not null default false,
  veg_servings int not null default 0 check (veg_servings between 0 and 20),
  water_glasses int not null default 0 check (water_glasses between 0 and 30),

  -- Honesty fields. Not failures — signal.
  salty_slip boolean not null default false,
  sleep_hours numeric(3, 1) check (sleep_hours is null or sleep_hours between 0 and 24),
  notes text check (notes is null or char_length(notes) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index health_days_user_date_idx on health_days (user_id, log_date desc);

alter table health_days enable row level security;

-- Same privacy pattern as meal_logs and as a player's hand in the game:
-- an anonymous browser identity only ever sees its own rows.
create policy "read own health days" on health_days
  for select using (user_id = auth.uid());

create policy "insert own health days" on health_days
  for insert with check (user_id = auth.uid());

create policy "update own health days" on health_days
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "delete own health days" on health_days
  for delete using (user_id = auth.uid());

create or replace function set_health_days_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger health_days_set_updated_at
  before update on health_days
  for each row
  execute function set_health_days_updated_at();

-- ---------------------------------------------------------------
-- Progress photos: metadata here, the image itself in Storage.
-- ---------------------------------------------------------------
create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  taken_on date not null,
  -- Path inside the private bucket, always "<user_id>/<uuid>.jpg".
  storage_path text not null unique,
  -- Weight at the time, copied in so a photo stays meaningful on its own.
  weight_kg numeric(5, 1),
  pose text not null default 'front' check (pose in ('front', 'side', 'back')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create index progress_photos_user_date_idx on progress_photos (user_id, taken_on desc);

alter table progress_photos enable row level security;

create policy "read own photos" on progress_photos
  for select using (user_id = auth.uid());

create policy "insert own photos" on progress_photos
  for insert with check (user_id = auth.uid());

create policy "update own photos" on progress_photos
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "delete own photos" on progress_photos
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------
-- Storage bucket. PRIVATE — body photos must never be publicly readable,
-- so the bucket is not public and the app reads through short-lived
-- signed URLs. Files are namespaced by user id, and the policies below
-- enforce that you can only touch your own folder.
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  5242880,                                        -- 5 MB ceiling
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "read own progress photos" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "upload own progress photos" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "delete own progress photos" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
