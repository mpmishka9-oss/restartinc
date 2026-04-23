import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";
import type { Chronotype } from "@/lib/restartData";
import PracticeCard from "./PracticeCard";
import { toast } from "sonner";

type CheckIn = Tables<"check_ins">;
type Practice = Tables<"practices">;

const DayCard = ({ title, label, children, defaultOpen }: { title: string; label: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="glass rounded-[20px] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 btn-press">
        <div className="text-left flex items-center gap-3">
          <span className="font-medium text-foreground">{title}</span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-foreground">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3 fade-up">{children}</div>}
    </div>
  );
};

const ThreeDayPlan = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [latestCi, setLatestCi] = useState<CheckIn | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ci } = await supabase.from("check_ins").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setLatestCi(ci);
      if (ci?.detected_state) {
        const { data: ps } = await supabase.from("practices").select("*").eq("state", ci.detected_state);
        setPractices(ps ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-app"><div className="dot-loader"><span/><span/><span/></div></div>;

  if (!latestCi) {
    return <div className="min-h-screen flex items-center justify-center bg-app px-6 pb-28">
      <p className="font-serif italic text-primary text-center">Complete your check-in to see your plan.</p>
    </div>;
  }

  const level = (latestCi.assigned_level ?? 1) as 1|2|3;
  const ct = (profile?.chronotype ?? null) as Chronotype | null;
  const neuro = practices.filter(p => p.system === "neuro");
  const ayur = practices.filter(p => p.system === "ayurveda");
  const day1 = [neuro[0], ayur[0]].filter(Boolean);
  const day2 = [ayur[1] ?? ayur[0], neuro[1] ?? neuro[0]].filter(Boolean);
  const day3 = [neuro[0], ayur[0]].filter(Boolean);
  const day3Bonus = (level + 1 > 3 ? 3 : level + 1) as 1|2|3;

  const save = async () => {
    if (!user || saved) return;
    await supabase.from("plans").insert({
      user_id: user.id, check_in_id: latestCi.id,
      day_1: day1.map(p => p.id), day_2: day2.map(p => p.id), day_3: day3.map(p => p.id),
    });
    setSaved(true); toast.success("Plan saved");
  };

  return (
    <div className="min-h-screen bg-app pb-32 px-6 pt-10">
      <div className="max-w-md mx-auto">
        <h1 className="font-serif text-[26px] text-foreground">Your 3-Day Plan</h1>
        <p className="font-serif italic text-[14px] text-primary mt-1">Built for where you are right now</p>

        <div className="mt-6 space-y-4">
          <div className="fade-up"><DayCard title="Day 1" label="Gentle reset" defaultOpen>
            {day1.map(p => <PracticeCard key={"d1"+p.id} practice={p} level={level} chronotype={ct} />)}
          </DayCard></div>
          <div className="fade-up" style={{ animationDelay: "100ms" }}><DayCard title="Day 2" label="Building momentum">
            {day2.map(p => <PracticeCard key={"d2"+p.id} practice={p} level={level} chronotype={ct} />)}
          </DayCard></div>
          <div className="fade-up" style={{ animationDelay: "200ms" }}><DayCard title="Day 3" label="Going deeper">
            {day3.map(p => <PracticeCard key={"d3"+p.id} practice={p} level={level} chronotype={ct} />)}
            {day3[0] && <PracticeCard key={"d3b"+day3[0].id} practice={day3[0]} level={day3Bonus} chronotype={ct} />}
          </DayCard></div>
        </div>

        <button onClick={save}
          className={`mt-8 w-full py-4 rounded-[20px] font-medium btn-press ${saved ? "bg-accent text-foreground" : "bg-primary text-white"}`}>
          {saved ? "Plan saved ✓" : "Save my plan"}
        </button>
      </div>
    </div>
  );
};

export default ThreeDayPlan;
