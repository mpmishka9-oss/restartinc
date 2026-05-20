CREATE TABLE public.cohort_2_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text,
  email text NOT NULL,
  dosha text,
  chronotype text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cohort_2_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
ON public.cohort_2_waitlist
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin reads waitlist"
ON public.cohort_2_waitlist
FOR SELECT
USING (is_admin());

CREATE INDEX idx_cohort_2_waitlist_email ON public.cohort_2_waitlist (email);