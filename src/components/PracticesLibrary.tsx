import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";
import type { Chronotype } from "@/lib/restartData";
import PracticeCard from "./PracticeCard";

type Practice = Tables<"practices">;
type CheckIn = Tables<"check_ins">;
type StateFilter = "all" | "anxiety" | "stress" | "burnout" | "overwhelm";
type SystemFilter = "all" | "neuro" | "ayurveda" | "peak";

const PracticesLibrary = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [tab, setTab] = useState<"foryou" | "explore">("foryou");
  const [practices, setPractices] = useState<Practice[]>([]);
  const [latestCi, setLatestCi] = useState<CheckIn | null>(null);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [sysFilter, setSysFilter] = useState<SystemFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from("practices").select("*");
      setPractices(all ?? []);
      if (user) {
        const { data: ci } = await supabase.from("check_ins").select("*")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        setLatestCi(ci);
      }
      setLoading(false);
    })();
  }, [user]);

  const ct = (profile?.chronotype ?? null) as Chronotype | null;
  const level = (latestCi?.assigned_level ?? 1) as 1|2|3;

  const forYou = useMemo(() => {
    if (!latestCi?.detected_state) return [];
    return practices.filter(p => p.state === latestCi.detected_state).slice(0, 3);
  }, [practices, latestCi]);

  const explore = useMemo(() => {
    return practices.filter(p => {
      if (stateFilter !== "all" && p.state !== stateFilter) return false;
      if (sysFilter !== "all" && p.system !== sysFilter) return false;
      return p.state !== "peak"; // peak shown separately
    });
  }, [practices, stateFilter, sysFilter]);

  const peakPractices = useMemo(() =>
    practices.filter(p => p.state === "peak"),
  [practices]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-app"><div className="dot-loader"><span/><span/><span/></div></div>;

  return (
    <div className="min-h-screen bg-app pb-32 px-6 pt-10">
      <div className="max-w-md mx-auto">
        <h1 className="font-serif text-2xl text-foreground">Practices</h1>

        {/* Tabs */}
        <div className="mt-5 flex gap-6 border-b border-primary/10">
          {[{id: "foryou", label: "For You"}, {id: "explore", label: "Explore All"}].map(t => {
            const a = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className="relative pb-3 btn-press">
                <span className={`text-sm ${a ? "text-foreground" : "text-foreground/40"}`}>{t.label}</span>
                {a && <>
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                </>}
              </button>
            );
          })}
        </div>

        {tab === "foryou" && (
          <div className="mt-5 space-y-3">
            {forYou.length === 0 ? (
              <p className="font-serif italic text-primary text-center mt-8">Complete a check-in for personalised picks.</p>
            ) : forYou.map(p => <PracticeCard key={p.id} practice={p} level={level} chronotype={ct} />)}
          </div>
        )}

        {tab === "explore" && (
          <div className="mt-5">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
              {(["all","anxiety","stress","burnout","overwhelm"] as StateFilter[]).map(s => (
                <button key={s} onClick={() => setStateFilter(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs btn-press capitalize ${
                    stateFilter === s ? "bg-primary text-white" : "border border-primary/30 text-foreground/70"
                  }`}>{s}</button>
              ))}
              <span className="w-px bg-primary/20 mx-1" />
              {(["neuro","ayurveda"] as SystemFilter[]).map(s => (
                <button key={s} onClick={() => setSysFilter(sysFilter === s ? "all" : s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs btn-press capitalize ${
                    sysFilter === s ? "bg-primary text-white" : "border border-primary/30 text-foreground/70"
                  }`}>{s}</button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {explore.map(p => <PracticeCard key={p.id} practice={p} level={level} chronotype={ct} />)}
            </div>

            {profile?.path === "ambitious" && peakPractices.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-serif text-xl text-foreground">Peak Mode</h2>
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent text-foreground">Performance</span>
                </div>
                <div className="space-y-3">
                  {peakPractices.map(p => <PracticeCard key={p.id} practice={p} level={level} chronotype={ct} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticesLibrary;
