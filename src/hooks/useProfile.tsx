import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";

export type Profile = Tables<"profiles">;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = async (patch: Partial<Profile>) => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", user.id).select().maybeSingle();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  return { profile, loading, refresh, update };
};
