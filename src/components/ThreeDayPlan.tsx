import { useEffect, useState } from "react";
import { ChevronDown, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Chronotype } from "@/lib/chronotype";
import { CHRONOTYPE_SLOT } from "@/lib/chronotypeSlots";
import { toast } from "sonner";

interface Practice {
  id: string;
  state: string;
  system: "neuro" | "ayurveda";
  title: string;
  why_it_works: string;
  estimated_minutes: number;
  level_1: string; level_2: string; level_3: string;
}

interface Props {
  chronotype: Chronotype;
  detectedState: string;
  onSave: () => void;
}

const PracticeCard = ({ p, level, chronotype }: { p: Practice; level: 1 | 2 | 3; chronotype: Chronotype }) => {
  const slot = CHRONOTYPE_SLOT[chronotype];
  const instructions = level === 1 ? p.level_1 : level === 2 ? p.level_2 : p.level_3;
  return (
    <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
          p.system === "neuro" ? "bg-accent/30 text-accent-foreground" : "bg-primary/40 text-primary-foreground"
        }`}>
          {p.system === "neuro" ? "Neuro" : "Ayurveda"}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{p.estimated_minutes} min</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{p.title}</h4>
      <p className="text-xs italic text-muted-foreground mb-2">Why this works: {p.why_it_works}</p>
      <p className="text-xs text-foreground/90 leading-relaxed mb-2">{instructions}</p>
      <p className="text-[10px] text-foreground/70">⏰ {slot.label}{slot.alt ? ` · ${slot.alt}` : ""}</p>
    </div>
  );
};

const DayCard = ({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <ChevronDown className={`w-4 h-4 text-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const ThreeDayPlan = ({ chronotype, detectedState, onSave }: Props) => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("practices").select("*").eq("state", detectedState as any);
      if (error) { console.error(error); toast.error("Couldn't load practices"); }
      setPractices((data ?? []) as Practice[]);
      setLoading(false);
    })();
  }, [detectedState]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // alternate neuro/ayurveda
  const neuro = practices.filter(p => p.system === "neuro");
  const ayur = practices.filter(p => p.system === "ayurveda");
  const day1 = [neuro[0], ayur[0]].filter(Boolean);
  const day2 = [ayur[0], neuro[0]].filter(Boolean);
  const day3 = [neuro[0], ayur[0]].filter(Boolean);

  return (
    <div className="min-h-screen px-6 py-8 pb-28"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-foreground" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your 3-day plan</p>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-6">A reset, paced for you</h1>

        <div className="space-y-4 mb-8">
          <DayCard title="Day 1 — Gentle reset" defaultOpen>
            {day1.map(p => <PracticeCard key={"d1"+p.id} p={p} level={1} chronotype={chronotype} />)}
          </DayCard>
          <DayCard title="Day 2 — Building momentum">
            {day2.map(p => <PracticeCard key={"d2"+p.id} p={p} level={1} chronotype={chronotype} />)}
          </DayCard>
          <DayCard title="Day 3 — Going deeper">
            {day3.slice(0,2).map(p => <PracticeCard key={"d3a"+p.id} p={p} level={1} chronotype={chronotype} />)}
            {day3[0] && <PracticeCard key={"d3b"+day3[0].id} p={day3[0]} level={2} chronotype={chronotype} />}
          </DayCard>
        </div>

        <button
          onClick={onSave}
          className="w-full py-4 rounded-2xl bg-foreground text-primary-foreground font-semibold shadow-lg"
        >
          Save my plan
        </button>
      </div>
    </div>
  );
};

export default ThreeDayPlan;