import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Practice {
  id: string; state: string; system: "neuro"|"ayurveda";
  title: string; why_it_works: string; estimated_minutes: number;
  level_1: string; level_2: string; level_3: string;
}

interface Props {
  detectedState: string | null;
  assignedLevel: 1 | 2 | 3;
}

const Card = ({ p, level }: { p: Practice; level: 1|2|3 }) => {
  const [open, setOpen] = useState(false);
  const ins = level === 1 ? p.level_1 : level === 2 ? p.level_2 : p.level_3;
  return (
    <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
          p.system === "neuro" ? "bg-accent/30 text-accent-foreground" : "bg-primary/40 text-primary-foreground"
        }`}>{p.system === "neuro" ? "Neuro" : "Ayurveda"}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{p.estimated_minutes} min</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground">{p.title}</h4>
      <p className="text-xs italic text-muted-foreground mt-1">{p.why_it_works}</p>
      <button onClick={() => setOpen(!open)} className="mt-2 text-xs flex items-center gap-1 text-foreground font-medium">
        {open ? "Hide" : "Show"} instructions <ChevronDown className={`w-3 h-3 transition-transform ${open?"rotate-180":""}`} />
      </button>
      {open && <p className="text-xs text-foreground/90 leading-relaxed mt-2 whitespace-pre-wrap">{ins}</p>}
    </div>
  );
};

const STATES = ["anxiety","stress","burnout","overwhelm"] as const;
const SYSTEMS = ["neuro","ayurveda"] as const;

const Chip = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
    active ? "bg-foreground text-primary-foreground" : "bg-card/60 text-foreground border border-border/50"
  }`}>{label}</button>
);

const PracticesTab = ({ detectedState, assignedLevel }: Props) => {
  const [tab, setTab] = useState<"foryou"|"explore">("foryou");
  const [all, setAll] = useState<Practice[]>([]);
  const [stateFilter, setStateFilter] = useState<string|null>(null);
  const [systemFilter, setSystemFilter] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("practices").select("*");
      setAll((data ?? []) as Practice[]);
    })();
  }, []);

  const forYou = useMemo(() => {
    if (!detectedState) return [];
    const matches = all.filter(p => p.state === detectedState);
    // alternate neuro/ayurveda, take 3
    const result: Practice[] = [];
    let wantNeuro = true;
    while (result.length < 3 && matches.length > 0) {
      const idx = matches.findIndex(p => (wantNeuro ? p.system === "neuro" : p.system === "ayurveda"));
      if (idx >= 0) { result.push(matches.splice(idx, 1)[0]); }
      else { result.push(matches.shift()!); }
      wantNeuro = !wantNeuro;
    }
    return result;
  }, [all, detectedState]);

  const explore = useMemo(() => {
    return all.filter(p =>
      (!stateFilter || p.state === stateFilter) &&
      (!systemFilter || p.system === systemFilter)
    );
  }, [all, stateFilter, systemFilter]);

  return (
    <div className="min-h-screen px-6 py-8 pb-28"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4">Practices</h1>

        <div className="flex gap-2 mb-6 bg-card/40 p-1 rounded-2xl">
          {(["foryou","explore"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "bg-foreground text-primary-foreground" : "text-foreground"
              }`}>
              {t === "foryou" ? "For You" : "Explore All"}
            </button>
          ))}
        </div>

        {tab === "foryou" && (
          <div className="space-y-3">
            {!detectedState && <p className="text-xs text-muted-foreground">Do a check-in first to see your personalised picks.</p>}
            {forYou.map(p => <Card key={p.id} p={p} level={assignedLevel} />)}
          </div>
        )}

        {tab === "explore" && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <Chip active={!stateFilter} label="All states" onClick={() => setStateFilter(null)} />
              {STATES.map(s => <Chip key={s} active={stateFilter===s} label={s.charAt(0).toUpperCase()+s.slice(1)} onClick={() => setStateFilter(s)} />)}
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              <Chip active={!systemFilter} label="All systems" onClick={() => setSystemFilter(null)} />
              {SYSTEMS.map(s => <Chip key={s} active={systemFilter===s} label={s.charAt(0).toUpperCase()+s.slice(1)} onClick={() => setSystemFilter(s)} />)}
            </div>
            <div className="space-y-3">
              {explore.map(p => <Card key={p.id} p={p} level={assignedLevel} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticesTab;