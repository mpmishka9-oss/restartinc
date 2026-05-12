import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { isDemoMode, DEMO_PROFILE } from "@/lib/demo";

export type Profile = Tables<"profiles">;

export const useProfile = () => {
  const { user } = useAuth();
  const demo = isDemoMode();
  const [profile, setProfile] = useState<Profile | null>(() => {
    if (!demo) return null;
    try {
      const stored = localStorage.getItem("restart_demo_profile");
      if (stored) return { ...DEMO_PROFILE, ...JSON.parse(stored) };
    } catch {}
    return DEMO_PROFILE;
  });
  const [loading, setLoading] = useState(!demo);

  const refresh = useCallback(async () => {
    if (demo) { setLoading(false); return; }
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data ?? null);
    setLoading(false);
  }, [user, demo]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = async (patch: Partial<Profile>) => {
    if (demo) {
      const next = { ...(profile ?? DEMO_PROFILE), ...patch } as Profile;
      setProfile(next);
      try { localStorage.setItem("restart_demo_profile", JSON.stringify(next)); } catch {}
      return { data: next, error: null };
    }
    if (!user) return;
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", user.id).select().maybeSingle();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  return { profile, loading, refresh, update };
};
