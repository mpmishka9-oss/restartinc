import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { getPracticesForState } from "@/lib/getPracticesForState";
import { CATEGORY_COLORS, type Practice as TriadPractice } from "@/data/practices";
import { useProfile } from "@/hooks/useProfile";
import logoImg from "@/assets/logo.png";
import DidiChat from "@/components/DidiChat";

type Practice = Tables<"practices">;
type CheckIn = Tables<"check_ins">;

const SYSTEM_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  neuro: { label: "Neuroscience", bg: "rgba(184,204,232,0.25)", fg: "#B8CCE8" },
  ayurveda: { label: "Ayurveda", bg: "rgba(29,158,117,0.2)", fg: "hsl(var(--rs-green))" },
  peak: { label: "Breathwork", bg: "rgba(245,240,160,0.2)", fg: "hsl(var(--rs-cream))" },
};

 import { useSubscription } from "@/hooks/useSubscription";
 import { PremiumLockBanner } from "@/components/PremiumGate";
 
 const PracticesScreen = () => {
   const { user } = useAuth();
   const { isActive } = useSubscription();
   const { profile } = useProfile();
   const isPro = isActive;
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
      className="phone-frame min-h-screen px-5 pt-10 pb-28" style={{ paddingTop: 54 }}>
      <TopBar />
      <DidiChat />

      <div className="mt-4 flex gap-2 p-1 rounded-xl bg-white/10 border border-white/20">
        {(["today", "library"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold ${
              tab === t ? "bg-rs-cream text-rs-navy" : "text-rs-cream"
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
          ) : (
            <div className="space-y-3">
              {(() => {
                const state = (typeof window !== "undefined" && localStorage.getItem("restart_checkin_state")) || "default";
                const day = parseInt((typeof window !== "undefined" && localStorage.getItem("restart_day")) || "1", 10) || 1;
                const triad = getPracticesForState(state, day);
                const items = [triad.neuro, triad.ayurveda, triad.breathwork];
                const featured = items[0];
                const firstName = (profile?.name || "").split(" ")[0] || "friend";
                const chronotype = profile?.chronotype || "natural";
                const hour = new Date().getHours();
                const windowLabel =
                  hour >= 5 && hour <= 11 ? "Morning window" :
                  hour >= 12 && hour <= 16 ? "Afternoon window" :
                  hour >= 17 && hour <= 21 ? "Evening window" : "Night window";
                return (
                  <>
                    <DidiPickCard
                      firstName={firstName}
                      chronotype={chronotype}
                      windowLabel={windowLabel}
                      practice={featured}
                    />
                    {items.map((p) => (
                      <TriadCard key={p.id} p={p} />
                    ))}
                  </>
                );
              })()}
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
                   <PracticeCard
                     key={`${lvl}-${p.id}`}
                     p={p}
                     level={lvl as 1|2|3}
                     isPro={isPro}
                     expanded={expanded === `${lvl}-${p.id}`}
                     onToggle={() => setExpanded(expanded === `${lvl}-${p.id}` ? null : `${lvl}-${p.id}`)}
                   />
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

 const PracticeCard = ({ p, expanded, onToggle, level, isPro }: { p: Practice; expanded: boolean; onToggle: () => void; level?: 1|2|3; isPro: boolean }) => {
   const badge = SYSTEM_BADGE[p.system] ?? SYSTEM_BADGE.neuro;
   const effectiveLevel = level || 1;
   const protocol = effectiveLevel === 1 ? p.level_1 : effectiveLevel === 3 ? p.level_3 : p.level_2;
   const isLocked = effectiveLevel > 1 && !isPro;
 
   return (
     <div className="rounded-2xl bg-white/13 border border-white/25 overflow-hidden">
       <button onClick={onToggle} className="w-full text-left p-4 btn-press">
         <div className="flex items-center gap-2">
           <span className="px-2 py-0.5 rounded-full text-rs-navy font-bold text-xs bg-rs-cream">{badge.label}</span>
           {isLocked && <span className="text-[10px] text-rs-cream font-bold">PRO</span>}
           <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-rs-navy font-medium">
             <Clock className="w-3 h-3" /> {p.duration_mins} min
           </span>
         </div>
         <p className="text-white text-[15px] font-semibold mt-2">{p.title}</p>
         <p className="text-rs-muted text-[12px] mt-1 line-clamp-1">{p.why_it_works}</p>
       </button>
       {expanded && (
         <div className="px-4 pb-4 -mt-1 space-y-3 relative">
           {isLocked ? (
             <div className="py-2">
               <p className="text-white/60 text-[13px] mb-3">Levels 2 and 3 protocols are tailored for deeper regulation and require Restart Pro.</p>
               <PremiumLockBanner feature={`Level ${effectiveLevel} protocols`} />
             </div>
           ) : (
             <>
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
             </>
           )}
         </div>
       )}
     </div>
   );
 };

export default PracticesScreen;

const TriadCard = ({ p }: { p: TriadPractice }) => (
  <div className="rounded-2xl bg-white/13 border border-white/25 p-4">
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-rs-cream text-rs-navy">
        {p.category}
      </span>
      <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-rs-cream font-medium">
        <Clock className="w-3 h-3" /> {p.duration}
      </span>
    </div>
    <p className="text-white text-[15px] font-semibold mt-2">{p.name}</p>
    <p className="text-[12px] mt-1 leading-relaxed text-rs-navy">{p.description}</p>
  </div>
);

const DidiPickCard = ({
  firstName, chronotype, windowLabel, practice,
}: { firstName: string; chronotype: string; windowLabel: string; practice: TriadPractice }) => (
  <div
    style={{
      background: "linear-gradient(135deg, #B8D4E0 0%, #D4C5E8 100%)",
      borderRadius: 20,
      padding: "18px 20px",
      marginBottom: 16,
      border: "1px solid rgba(255,255,255,0.6)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: "50%", background: "#1A2A4A",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}
      >
        <img src={logoImg} alt="Didi" style={{ width: 22, height: 22, objectFit: "contain" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#1A2A4A", letterSpacing: 1, textTransform: "uppercase" }}>
        Didi's Pick for you
      </span>
      <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(26,42,74,0.5)" }}>{windowLabel}</span>
    </div>
    <p style={{ fontSize: 13, color: "#1A2A4A", fontWeight: 500, lineHeight: 1.5, margin: "10px 0 6px" }}>
      {firstName}, your {chronotype} rhythm makes right now ideal for this.
    </p>
    <p style={{ fontSize: 17, fontWeight: 700, color: "#1A2A4A", margin: 0 }}>{practice.name}</p>
    <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
      <span
        style={{
          background: "#F2EE9A", color: "#5A4A1A", borderRadius: 20,
          padding: "4px 10px", fontSize: 11, fontWeight: 600,
        }}
      >
        {practice.category}
      </span>
      <button
        type="button"
        style={{
          marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#1A2A4A",
          background: "transparent",
        }}
      >
        Start now →
      </button>
    </div>
  </div>
);
