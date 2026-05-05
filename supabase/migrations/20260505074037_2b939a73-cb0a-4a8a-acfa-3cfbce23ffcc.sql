CREATE TABLE IF NOT EXISTS public.user_journey_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own journey progress" ON public.user_journey_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journey progress" ON public.user_journey_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journey progress" ON public.user_journey_progress FOR UPDATE USING (auth.uid() = user_id);