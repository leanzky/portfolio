-- Drops blood pressure tracking, adds a food log, and limits progress
-- photos to two poses.
--
-- Run this after 0009. If 0009 has not been run yet, run it first and then
-- this one — the sequence is safe either way, and 0009 is left untouched
-- because editing an applied migration is how environments drift apart.
--
-- Blood pressure is dropped because there is no monitor to measure it with.
-- It gets checked at a clinic or pharmacy instead, so there is nothing daily
-- to record. Safe to drop: no readings have been entered.

alter table health_days
  drop column if exists systolic,
  drop column if exists diastolic,
  drop column if exists pulse;

-- What was actually eaten, in plain words. Free text rather than a food
-- database: the point is a record you will actually fill in on a phone,
-- and something to look back on when a week goes badly.
alter table health_days
  add column if not exists breakfast text
    check (breakfast is null or char_length(breakfast) <= 500),
  add column if not exists lunch text
    check (lunch is null or char_length(lunch) <= 500),
  add column if not exists dinner text
    check (dinner is null or char_length(dinner) <= 500),
  add column if not exists snacks text
    check (snacks is null or char_length(snacks) <= 500),
  -- Rice is the portion that actually moves the needle, so it gets a number.
  add column if not exists rice_cups numeric(3, 1)
    check (rice_cups is null or rice_cups between 0 and 20);

-- Front and side only. A back photo needs someone else to hold the phone,
-- which is friction that stops the photo being taken at all.
alter table progress_photos
  drop constraint if exists progress_photos_pose_check;

alter table progress_photos
  add constraint progress_photos_pose_check check (pose in ('front', 'side'));
