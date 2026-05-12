import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

const DEMO_KEY = "restart_demo_mode";

export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  const fromUrl = new URLSearchParams(window.location.search).get("demo") === "true";
  if (fromUrl) {
    try { sessionStorage.setItem(DEMO_KEY, "1"); } catch {}
    return true;
  }
  try { return sessionStorage.getItem(DEMO_KEY) === "1"; } catch { return false; }
};

export const exitDemoMode = () => {
  try { sessionStorage.removeItem(DEMO_KEY); } catch {}
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  window.location.replace(url.pathname + (url.search || "") + url.hash);
};

export const DEMO_USER = {
  id: "demo-user-0000",
  email: "demo@restart.app",
  app_metadata: {},
  user_metadata: { name: "Samaira" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

export const DEMO_PROFILE: Tables<"profiles"> = {
  id: "demo-user-0000",
  email: "demo@restart.app",
  name: "Samaira",
  age: null,
  chronotype: "wolf" as any,
  chronotype_description: null,
  chronotype_headline: null,
  completed_practices: 0,
  consent_given_at: new Date().toISOString(),
  consent_signature: "Samaira",
  created_at: new Date().toISOString(),
  current_day: 1,
  didi_xp: 0,
  goal: "Perform at my peak without burning out",
  journey_started_at: new Date().toISOString(),
  onboarding_answers: {} as any,
  onboarding_completed: true,
  path: "ambitious" as any,
  streak_days: 0,
  updated_at: new Date().toISOString(),
  whatsapp_phone: null,
};
