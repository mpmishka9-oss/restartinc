import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import BottomNav from "@/components/layout/BottomNav";

type Practice = Tables<"practices">;
type CheckIn = Tables<"check_ins">;

const SYSTEM_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  neuro: { label: "Neuroscience", bg: "rgba(184,204,232,0.25)", fg: "#B8CCE8" },
  ayurveda: { label: "Ayurveda", bg: "rgba(29,158,117,0.2)", fg: "hsl(var(--rs-green))" },
  peak: { label: "Breathwork", bg: "rgba(245,240,160,0.2)", fg: "hsl(var(--rs-cream))" },
};

const PracticesScreen = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"today" | "library">("today");
  const [subTab, setSubTab] = useState<"neuro" | "ayurveda">("neuro");
  const [today, setToday] = useState<Practice[]>([]);
  const [allPractices, setAllPractices] = useState<Practice[]>([]);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const start = new Date(); start.setHours(0,0,0,0);
      const { data: ci } = await supabase.from("check_ins").select("*")
        .eq("user_id", user.id).gte("created_at", start.toISOString())
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      setCheckIn(ci);

      if (ci?.detected_state) {
        const { data: ps } = await supabase.from("practices").select("*").eq("state", ci.detected_state).limit(3);
        setToday(ps ?? []);
      }
      const { data: all } = await supabase.from("practices").select("*").order("title");
      setAllPractices(all ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="phone-frame min-h-screen flex items-center justify-center"><div className="dot-loader"><span/><span/><span/></div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-5 pt-10 pb-28">
      <h1 className="text-[24px] font-bold text-white">Practices</h1>

      <div className="mt-4 flex gap-2 p-1 rounded-xl bg-white/10 border border-white/20">
        {(["today", "library"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold ${
              tab === t ? "bg-rs-cream text-rs-navy" : "text-white/70"
            }`}>{t === "today" ? "Today's Practices" : "Full Library"}</button>
        ))}
      </div>

      {tab === "today" && (
        <div className="mt-5">
          {!checkIn ? (
            <div className="rounded-2xl p-6 bg-white/13 border border-white/25 text-center">
              <p className="text-white text-[15px]">Check in first so Didi can personalise your practices.</p>
              <button onClick={() => nav("/checkin")}
                className="mt-4 px-6 py-3 btn-cream inline-flex items-center gap-2">
                Check in <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : today.length === 0 ? (
            <p className="text-rs-muted text-center mt-6 text-[14px]">No practices yet for this state — check back soon.</p>
          ) : (
            <div className="space-y-3">
              {today.map((p) => <PracticeCard key={p.id} p={p} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />)}
            </div>
          )}
        </div>
      )}

      {tab === "library" && (
        <div className="mt-5">
          <div className="flex gap-2 mb-4">
            {(["neuro", "ayurveda"] as const).map((s) => (
              <button key={s} onClick={() => setSubTab(s)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border ${
                  subTab === s ? "bg-rs-cream text-rs-navy border-rs-cream" : "bg-transparent text-white/70 border-white/25"
                }`}>{s === "neuro" ? "Neuroscience" : "Ayurvedic"}</button>
            ))}
          </div>
          {[1,2,3].map((lvl) => (
            <div key={lvl} className="mb-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold mb-2">Level {lvl}</p>
              <div className="space-y-2.5">
                {allPractices.filter((p) => p.system === subTab).map((p) => (
                  <PracticeCard key={`${lvl}-${p.id}`} p={p} level={lvl as 1|2|3}
                    expanded={expanded === `${lvl}-${p.id}`}
                    onToggle={() => setExpanded(expanded === `${lvl}-${p.id}` ? null : `${lvl}-${p.id}`)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </motion.div>
  );
};

const PracticeCard = ({ p, expanded, onToggle, level }: { p: Practice; expanded: boolean; onToggle: () => void; level?: 1|2|3 }) => {
  const badge = SYSTEM_BADGE[p.system] ?? SYSTEM_BADGE.neuro;
  const protocol = level === 1 ? p.level_1 : level === 3 ? p.level_3 : p.level_2;
  return (
    <div className="rounded-2xl bg-white/13 border border-white/25 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 btn-press">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-white/70">
            <Clock className="w-3 h-3" /> {p.duration_mins} min
          </span>
        </div>
        <p className="text-white text-[15px] font-semibold mt-2">{p.title}</p>
        <p className="text-rs-muted text-[12px] mt-1 line-clamp-1">{p.why_it_works}</p>
      </button>
      {expanded && (
        <div className="px-4 pb-4 -mt-1 space-y-3">
          <div>
            <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">Protocol</p>
            <p className="text-white text-[13px] mt-1 leading-relaxed">{protocol}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">Why it works</p>
            <p className="text-white text-[13px] mt-1 leading-relaxed">{p.why_it_works}</p>
          </div>
          <button className="w-full mt-2 py-3 btn-cream flex items-center justify-center gap-2">
            Start <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticesScreen;
