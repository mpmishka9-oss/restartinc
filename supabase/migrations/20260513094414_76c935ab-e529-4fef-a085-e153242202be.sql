
-- 1. Dosha enum
DO $$ BEGIN
  CREATE TYPE public.dosha_type AS ENUM ('Vata', 'Pitta', 'Kapha');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Add dosha column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dosha public.dosha_type;

-- 3. Practice history
CREATE TABLE IF NOT EXISTS public.practice_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_id TEXT NOT NULL,
  day_number INTEGER,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_history_user_shown
  ON public.practice_history(user_id, shown_at DESC);

ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own practice history" ON public.practice_history;
CREATE POLICY "Users read own practice history"
  ON public.practice_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own practice history" ON public.practice_history;
CREATE POLICY "Users insert own practice history"
  ON public.practice_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin reads all practice history" ON public.practice_history;
CREATE POLICY "Admin reads all practice history"
  ON public.practice_history FOR SELECT
  USING (public.is_admin());
