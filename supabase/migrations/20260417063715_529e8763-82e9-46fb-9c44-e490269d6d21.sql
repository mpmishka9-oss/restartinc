-- Timestamp helper (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Chronotype enum
DO $$ BEGIN
  CREATE TYPE public.chronotype AS ENUM ('Lion', 'Bear', 'Owl', 'Dolphin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- User responses table (keyed by email, no auth)
CREATE TABLE public.user_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT,
  age TEXT,
  gender TEXT,
  sleep_general TEXT,
  person_type TEXT,
  regular_practice TEXT,
  wellness_attitude TEXT,
  path TEXT,
  reflective_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  chronotype public.chronotype,
  chronotype_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;

-- No auth: allow anonymous insert/select/update keyed by email.
-- NOTE: this is intentionally permissive for the no-auth flow.
CREATE POLICY "Anyone can insert responses"
  ON public.user_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read responses"
  ON public.user_responses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update responses"
  ON public.user_responses FOR UPDATE
  USING (true);

CREATE TRIGGER update_user_responses_updated_at
  BEFORE UPDATE ON public.user_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_responses_email ON public.user_responses(email);