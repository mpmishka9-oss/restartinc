
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS blocker text,
  ADD COLUMN IF NOT EXISTS intensity_score integer,
  ADD COLUMN IF NOT EXISTS onboarding_path text,
  ADD COLUMN IF NOT EXISTS chronotype text,
  ADD COLUMN IF NOT EXISTS day_number integer,
  ADD COLUMN IF NOT EXISTS time_of_checkin timestamp with time zone DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_check_ins_user_created
  ON public.check_ins (user_id, created_at DESC);
