import { supabase } from "@/integrations/supabase/client";

const SNAPSHOT_KEY = "restart_investor_demo_snapshot";
const ACTIVE_KEY = "restart_investor_demo_active";

export const ADMIN_EMAIL = "mpmishka9@gmail.com";

export const isInvestorDemoActive = (): boolean => {
  try { return localStorage.getItem(ACTIVE_KEY) === "1"; } catch { return false; }
};

const TABLES = ["check_ins", "plans", "practice_history", "user_journey_progress", "restart_feedback"] as const;

export const startInvestorDemo = async (userId: string) => {
  // Snapshot profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const snapshot: Record<string, unknown> = { profile, tables: {} as Record<string, unknown[]> };
  for (const t of TABLES) {
    const { data } = await supabase.from(t as any).select("*").eq("user_id", userId);
    (snapshot.tables as Record<string, unknown[]>)[t] = data ?? [];
  }
  try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch {}

  // Wipe user-generated rows
  await Promise.all(TABLES.map((t) => supabase.from(t as any).delete().eq("user_id", userId)));

  // Reset profile to brand-new state
  await supabase.from("profiles").update({
    name: null,
    path: null,
    chronotype: null,
    chronotype_headline: null,
    chronotype_description: null,
    onboarding_answers: {},
    completed_practices: 0,
    streak_days: 0,
    onboarding_completed: false,
    current_day: 1,
    journey_started_at: null,
    whatsapp_phone: null,
    age: null,
    goal: null,
    consent_given_at: null,
    consent_signature: null,
    didi_xp: 0,
    dosha: null,
  } as any).eq("id", userId);

  try { localStorage.setItem(ACTIVE_KEY, "1"); } catch {}
};

export const exitInvestorDemo = async (userId: string) => {
  let snapshot: any = null;
  try { snapshot = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "null"); } catch {}

  // Wipe current demo rows
  await Promise.all(TABLES.map((t) => supabase.from(t as any).delete().eq("user_id", userId)));

  if (snapshot?.profile) {
    const { id, created_at, updated_at, ...rest } = snapshot.profile;
    await supabase.from("profiles").update(rest as any).eq("id", userId);
  }
  if (snapshot?.tables) {
    for (const t of TABLES) {
      const rows = (snapshot.tables as Record<string, unknown[]>)[t] || [];
      if (rows.length) {
        await supabase.from(t as any).insert(rows as any);
      }
    }
  }

  try { localStorage.removeItem(ACTIVE_KEY); } catch {}
  try { localStorage.removeItem(SNAPSHOT_KEY); } catch {}
};