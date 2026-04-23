-- Drop old tables (full reset per spec)
DROP TABLE IF EXISTS public.check_ins CASCADE;
DROP TABLE IF EXISTS public.practices CASCADE;
DROP TABLE IF EXISTS public.user_responses CASCADE;
DROP TYPE IF EXISTS public.chronotype CASCADE;
DROP TYPE IF EXISTS public.detected_state CASCADE;
DROP TYPE IF EXISTS public.practice_system CASCADE;

-- Enums
CREATE TYPE public.chronotype AS ENUM ('lion','bear','wolf','dolphin');
CREATE TYPE public.user_path AS ENUM ('ambitious','emotional');
CREATE TYPE public.detected_state AS ENUM ('anxiety','stress','burnout','overwhelm','peak');
CREATE TYPE public.practice_system AS ENUM ('neuro','ayurveda','peak');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  path public.user_path,
  chronotype public.chronotype,
  chronotype_headline TEXT,
  chronotype_description TEXT,
  onboarding_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_practices INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Practices (public library)
CREATE TABLE public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state public.detected_state NOT NULL,
  system public.practice_system NOT NULL,
  title TEXT NOT NULL,
  why_it_works TEXT NOT NULL,
  level_1 TEXT NOT NULL,
  level_2 TEXT NOT NULL,
  level_3 TEXT NOT NULL,
  duration_mins INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read practices" ON public.practices FOR SELECT USING (true);

-- Check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  didi_response TEXT,
  detected_state public.detected_state,
  severity_score INT,
  assigned_level INT,
  dosha TEXT,
  level_description TEXT,
  practices_shown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own check_ins" ON public.check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own check_ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_check_ins_user_created ON public.check_ins (user_id, created_at DESC);

-- Plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  day_1 JSONB NOT NULL DEFAULT '[]'::jsonb,
  day_2 JSONB NOT NULL DEFAULT '[]'::jsonb,
  day_3 JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own plans" ON public.plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plans" ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plans" ON public.plans FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_plans_user_created ON public.plans (user_id, created_at DESC);