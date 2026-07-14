-- ============================================================================
-- Bio-Link Stability Index ("System Sync")
-- Tracks the freshness of a user's biometric data stream. Every meal scan or
-- fridge update bumps profiles.last_sync_at; the app computes the live
-- degradation curve from that timestamp at read time.
-- ============================================================================

alter table public.profiles
  add column if not exists last_sync_at timestamptz not null default now();

-- Whenever the user feeds the telemetry core (logs a meal or updates the
-- fridge), refresh their sync timestamp. SECURITY DEFINER so the trigger can
-- update the owning profile row regardless of the writer's RLS context.
create or replace function public.bump_bio_sync()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set last_sync_at = now()
   where id = coalesce(new.user_id, old.user_id);
  return new;
end; $$;

create trigger meals_bump_sync
  after insert or update on public.meals
  for each row execute function public.bump_bio_sync();

create trigger fridge_bump_sync
  after insert or update on public.fridge_items
  for each row execute function public.bump_bio_sync();

-- Server-side parity with lib/syncStability.ts: percent integrity from the
-- last sync timestamp. STABLE (not IMMUTABLE) because it depends on now().
create or replace function public.bio_sync_percent(last_sync timestamptz)
returns int language sql stable as $$
  select greatest(
    8,
    case
      when extract(epoch from (now() - last_sync)) / 3600 <= 24 then 100
      else round(100 - (extract(epoch from (now() - last_sync)) / 3600 - 24) * 1.15)::int
    end
  );
$$;
