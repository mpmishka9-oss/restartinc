-- Add columns to user_responses
ALTER TABLE public.user_responses
  ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chronotype_headline text,
  ADD COLUMN IF NOT EXISTS chronotype_description text;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.detected_state AS ENUM ('anxiety','stress','burnout','overwhelm');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.practice_system AS ENUM ('neuro','ayurveda');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text,
  warm_response text,
  detected_state public.detected_state,
  severity_score integer,
  assigned_level integer,
  dosha text,
  suggested_practice_types jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read check_ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Anyone can insert check_ins" ON public.check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update check_ins" ON public.check_ins FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_check_ins_user_created ON public.check_ins(user_id, created_at DESC);

-- practices table
CREATE TABLE IF NOT EXISTS public.practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state public.detected_state NOT NULL,
  system public.practice_system NOT NULL,
  title text NOT NULL,
  why_it_works text NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 10,
  level_1 text NOT NULL,
  level_2 text NOT NULL,
  level_3 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read practices" ON public.practices FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_practices_state_system ON public.practices(state, system);