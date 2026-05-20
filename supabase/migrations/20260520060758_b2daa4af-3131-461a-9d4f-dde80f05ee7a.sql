
CREATE TABLE public.restart_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text,
  dosha text,
  chronotype text,
  mood_d1 integer,
  mood_d2 integer,
  mood_d3 integer,
  q1_felt_difference text,
  q2_practice_hit_hardest text,
  q3_pay_monthly text,
  q4_focus_vote text,
  q5_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.restart_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback"
  ON public.restart_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own feedback"
  ON public.restart_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all feedback"
  ON public.restart_feedback FOR SELECT
  USING (is_admin());
