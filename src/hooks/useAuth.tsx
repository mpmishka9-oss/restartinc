import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, DEMO_USER, exitDemoMode } from "@/lib/demo";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const demo = isDemoMode();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(demo ? DEMO_USER : null);
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    if (demo) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null); setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setUser(data.session?.user ?? null); setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [demo]);

  const signOut = async () => {
    if (demo) { exitDemoMode(); return; }
    await supabase.auth.signOut();
  };
  return <Ctx.Provider value={{ user, session, loading, signOut }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
