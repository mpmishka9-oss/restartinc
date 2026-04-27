ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_day integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS journey_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_phone text,
  ADD COLUMN IF NOT EXISTS age text,
  ADD COLUMN IF NOT EXISTS goal text;