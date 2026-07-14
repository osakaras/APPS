-- ============================================================================
-- Onboarding: language preference + physical metrics + BMI status.
-- Extends the profiles table from 0001_init.sql.
-- ============================================================================

-- Supportive, reframed BMI tiers (never blunt clinical labels in the UI).
create type bmi_status as enum (
  'lean_light',       -- clinically underweight  (BMI < 18.5)
  'optimal_balance',  -- clinically normal       (18.5 – 24.9)
  'solid_built',      -- clinically overweight   (25 – 29.9)
  'focus_zone'        -- clinically obese         (BMI >= 30)
);

alter table public.profiles
  add column if not exists preferred_language text not null default 'en',
  add column if not exists age            int,
  add column if not exists weight_kg      numeric(5,1),
  add column if not exists height_cm      numeric(5,1),
  -- Stored generated so the persisted BMI can never drift from the metrics.
  add column if not exists calculated_bmi numeric(4,1)
    generated always as (
      case
        when weight_kg is not null and height_cm is not null and height_cm > 0
        then round((weight_kg / ((height_cm / 100) ^ 2))::numeric, 1)
      end
    ) stored,
  add column if not exists bmi_status     bmi_status,
  add column if not exists onboarded_at   timestamptz;

-- Validation guards (kept generous so the live UI never rejects mid-typing
-- — the client clamps, these only stop nonsense from being saved).
alter table public.profiles
  add constraint profiles_age_chk    check (age is null or (age between 5 and 120)),
  add constraint profiles_weight_chk check (weight_kg is null or (weight_kg between 20 and 400)),
  add constraint profiles_height_chk check (height_cm is null or (height_cm between 80 and 260));

-- Helper to resolve a BMI value to the reframed status enum, mirroring lib/bmi.ts.
create or replace function public.bmi_status_for(bmi numeric)
returns bmi_status language sql immutable as $$
  select case
    when bmi is null      then null
    when bmi < 18.5       then 'lean_light'::bmi_status
    when bmi < 25         then 'optimal_balance'::bmi_status
    when bmi < 30         then 'solid_built'::bmi_status
    else 'focus_zone'::bmi_status
  end;
$$;

-- Keep bmi_status in sync with the generated calculated_bmi automatically.
create or replace function public.sync_bmi_status()
returns trigger language plpgsql as $$
begin
  new.bmi_status := public.bmi_status_for(new.calculated_bmi);
  return new;
end; $$;

create trigger profiles_sync_bmi
  before insert or update of weight_kg, height_cm on public.profiles
  for each row execute function public.sync_bmi_status();
