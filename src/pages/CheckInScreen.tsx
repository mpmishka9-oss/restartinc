import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
 import { useSubscription } from "@/hooks/useSubscription";
import TopBar from "@/components/layout/TopBar";
import { getPracticesForState, getWhyTodayLabel } from "@/lib/getPracticesForState";
import { CATEGORY_COLORS } from "@/data/practices";

const FEELINGS = [
  "Anxious / worried",
  "Stressed / under pressure",
  "Low / sad",
  "Overwhelmed / scattered",
  "Angry / frustrated",
  "Focused and clear",
  "Good / motivated",
  "Numb / flat",
];

const AMBITIOUS_BLOCKERS = [
  "My focus keeps breaking",
  "I'm avoiding something important",
  "I have no energy to start",
  "I'm overthinking everything",
  "Nothing — I'm ready to go",
];

// Map a long feeling label to the short emotion key used by STATE_INSIGHT / practices
const feelingKey = (f: string): string => {
  const s = f.toLowerCase();
  if (s.startsWith("anxious")) return "Anxious";
  if (s.startsWith("stressed")) return "Stressed";
  if (s.startsWith("low")) return "Low";
  if (s.startsWith("overwhelmed")) return "Overwhelmed";
  if (s.startsWith("angry")) return "Angry";
  if (s.startsWith("focused")) return "Focused";
  if (s.startsWith("good")) return "Good";
  if (s.startsWith("numb")) return "Numb";
  return "Stressed";
};

const intensityLabel = (n: number) =>
  n <= 3 ? "Barely there — more like background noise"
  : n <= 6 ? "Noticeable — it's affecting me"
  : n <= 8 ? "Strong — hard to ignore"
  : "Overwhelming — I really need support";

const ROLE_CHIPS: Record<string, string> = {
  "Student": "Balancing study pressure and your wellbeing",
  "Working professional": "Navigating work and staying whole",
  "Freelancer or self-employed": "Building something while managing yourself",
  "Freelancer / self-employed": "Building something while managing yourself",
  "Between jobs": "In a transition — that takes courage",
  "Between jobs / taking a break": "In a transition — that takes courage",
  "Homemaker or caregiver": "Giving a lot to others",
  "Homemaker / caregiver": "Giving a lot to others",
};

const CHRONO_CHIPS: Record<string, string> = {
  lion: "As a Lion, your peak is in the morning",
  bear: "As a Bear, you flow with the day",
  owl: "As an Owl, you come alive later",
  dolphin: "As a Dolphin, your mind runs fast and light",
};

const PATH_CHIPS: Record<string, string> = {
  ambitious: "You're here to perform and achieve more",
  stressed: "You're navigating some heavy stuff right now",
};

const didiInsight = (chronotype: string, feelingShort: string): string => {
  const c = (chronotype || "").toLowerCase();
  const f = feelingShort.toLowerCase();
  const key = `${c}_${f}`;
  const map: Record<string, string> = {
    lion_anxious: "Your Lion drive is working against you right now — your brain is in alert mode, not execution mode. Let's reset the nervous system first.",
    lion_focused: "You're in your zone. This is what Lion energy feels like — protect this window.",
    bear_overwhelmed: "You've absorbed too much today. Bears carry stress quietly until it spills — let's release some pressure before it builds further.",
    bear_low: "Your rhythm is off today. That's okay — Bears have slower days. Small movement forward is enough.",
    owl_anxious: "Late-night thinking patterns are activating early. Your creative mind needs a pattern interrupt before the spiral deepens.",
    owl_focused: "You're hitting your natural rhythm. Owls find their flow — ride this window as long as you can.",
    dolphin_overwhelmed: "Your Dolphin mind is running too many tabs. The goal right now is not to solve everything — it's to close a few tabs.",
    dolphin_anxious: "Your nervous system is highly sensitive — that's also why you're so perceptive. Right now it needs calming, not more input.",
    lion_stressed: "Your Lion drive is pushing through stress on willpower alone. That's a short runway. Let's reset the system before you burn the tank.",
    lion_low: "Even Lions have slow days. Your energy dip is hormonal, not a character flaw. One small action is enough to restart the reward circuit.",
    lion_overwhelmed: "You've taken on too much — classic Lion pattern. Narrow the field to one thing. Your brain can't execute when it's managing twenty priorities.",
    lion_angry: "Lion anger is high-octane fuel. Before you act on it, let's discharge the cortisol first — then you'll think clearly.",
    lion_numb: "Numbness in a Lion usually means the nervous system hit its ceiling. Stillness isn't failure — it's your body asking for a reset.",
    bear_anxious: "Bears absorb the mood of the room. Your anxiety might not even be yours — check what you've been exposed to today.",
    bear_focused: "You're in your natural rhythm. Bears perform best mid-morning to early afternoon — protect this window.",
    bear_angry: "Bear anger builds slowly and releases hard. You've been holding this. A physical discharge — even a short walk — will help more than thinking through it.",
    bear_numb: "You've been giving steadily for too long without refilling. This flatness is depletion, not depression. Small restoration first.",
    owl_stressed: "Late-night stress is your default trap. Your creative mind turns stress into spirals after 10pm. Interrupt the pattern now before it loops.",
    owl_low: "Owls often crash in the morning — your low might just be circadian, not emotional. Don't make meaning of a morning dip.",
    owl_overwhelmed: "Your Owl mind processes deeply — which means overwhelm hits harder and longer. You need to offload before you can think clearly.",
    owl_angry: "You'll process this best in writing, later tonight. Right now, create distance from the trigger — your insight will come when the cortisol clears.",
    owl_numb: "Owls go numb when overstimulated and under-restored. Your sensitivity is the cost of your depth. Rest is not optional right now.",
    dolphin_stressed: "Your Dolphin nervous system runs hot. Stress compounds fast for you — small inputs create big outputs. Regulate the body first, then the mind.",
    dolphin_low: "Dolphins tire easily from their own internal noise. Your low energy might be mental exhaustion, not emotional collapse. Light movement and silence will restore you faster than anything else.",
  };
  return map[key] ?? "Didi sees where you are. Let's work with what you have right now, not against it.";
};

const STATE_INSIGHT: Record<string, { label: string; insight: string; region: string }> = {
  Anxious: { label: "Anxious", insight: "Your amygdala is firing. A long exhale signals safety to your nervous system within 90 seconds.", region: "amygdala" },
  Stressed: { label: "Stressed", insight: "Cortisol is up. A 2-minute physiological sigh resets your CO₂ and pulls you out of fight-or-flight.", region: "amygdala" },
  Low: { label: "Low", insight: "Dopamine is low. A small completed action — even 4 minutes of movement — restarts the reward circuit.", region: "ventral_striatum" },
  Overwhelmed: { label: "Overwhelmed", insight: "Your prefrontal cortex is overloaded. Single-sense focus narrows the field and brings the PFC back online.", region: "pfc" },
  Angry: { label: "Angry", insight: "Your amygdala is hijacking your prefrontal cortex. Naming the emotion out loud and a long exhale re-engage top-down regulation within 90 seconds.", region: "amygdala" },
  Focused: { label: "Focused", insight: "You're in flow. Protect this state — no notifications, no context switches.", region: "pfc" },
  Good: { label: "Good", insight: "Use this energy to build a habit. Identity rewriting locks in change when mood is positive.", region: "default_mode" },
  Energised: { label: "Energised", insight: "Norepinephrine is high. This is your window for hard tasks — front-load the difficult thing.", region: "lc" },
  Numb: { label: "Numb", insight: "Your nervous system is in shutdown. Cold water on your wrists or neck restores arousal in seconds.", region: "vagus" },
};

type Step = "greet" | "context" | "q1" | "q2" | "submitting" | "result";

const Typewriter = ({ text, onDone }: { text: string; onDone?: () => void }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i < text.length) {
      const t = setTimeout(() => setI(i + 1), 40);
      return () => clearTimeout(t);
    } else {
      onDone?.();
    }
  }, [i, text]);
  return <span>{text.slice(0, i)}</span>;
};

const CheckInScreen = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
   const { isActive } = useSubscription();
  const [step, setStep] = useState<Step>("greet");
  const [feeling, setFeeling] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [blocker, setBlocker] = useState("");
  const [didiResp, setDidiResp] = useState<{ state: string; insight: string; reply: string } | null>(null);

  // Sync current_day from profile → localStorage so practice rotation works
  // even before the user visits the Journey tab.
  useEffect(() => {
    const d = (profile as any)?.current_day;
    if (typeof d === "number" && d > 0) {
      try { localStorage.setItem("restart_day", String(d)); } catch {}
    } else {
      try {
        if (!localStorage.getItem("restart_day")) localStorage.setItem("restart_day", "1");
      } catch {}
    }
  }, [profile]);

  // Read onboarding context from AppContext / localStorage
  const onboardingPath = (profile?.path as string) || (() => { try { return localStorage.getItem("restart_path") || ""; } catch { return ""; } })();
  const onboardingChronotype = (profile?.chronotype as string) || (() => { try { return localStorage.getItem("restart_chronotype") || ""; } catch { return ""; } })();
  const onboardingRole = (() => {
    try {
      const r = localStorage.getItem("restart_role");
      if (r) return r;
      const oa = (profile as any)?.onboarding_answers;
      return oa?.role || "";
    } catch { return ""; }
  })();

  const pathChip = PATH_CHIPS[(onboardingPath || "").toLowerCase()] || "";
  const chronoChip = CHRONO_CHIPS[(onboardingChronotype || "").toLowerCase()] || "";
  const roleChip = ROLE_CHIPS[onboardingRole] || "";

  const submit = async () => {
    setStep("submitting");
    try {
      const fShort = feelingKey(feeling); // e.g. "Anxious"
      // Map UI feeling → DB enum detected_state
      const map: Record<string, string> = {
        Anxious: "anxiety", Stressed: "stress", Low: "burnout",
        Overwhelmed: "overwhelm", Angry: "stress", Focused: "peak", Good: "peak", Energised: "peak", Numb: "burnout",
      };
      const detected = map[fShort] ?? "stress";
      const q2Answer = onboardingPath === "ambitious"
        ? `Blocker: ${blocker}`
        : `Intensity: ${intensity}/10 (${intensityLabel(intensity)})`;
      const message = `Feeling ${feeling.toLowerCase()}. ${q2Answer}.`;

      const { data, error } = await supabase.functions.invoke("check-in", {
        body: {
          message,
          path: profile?.path ?? "emotional",
          chronotype: profile?.chronotype ?? "bear",
        },
      });
      if (error) throw error;

      const insight = STATE_INSIGHT[fShort]?.insight ?? "";
      const personalised = didiInsight(onboardingChronotype, fShort);
      const reply = personalised;
      const dState = data?.detected_state ?? detected;

      // Save check-in
      if (user) {
        await supabase.from("check_ins").insert({
          user_id: user.id,
          detected_state: dState as any,
          severity_score: onboardingPath === "ambitious" ? 5 : intensity,
          assigned_level: data?.assigned_level ?? 1,
          message, didi_response: data?.didi_response ?? reply,
          level_description: data?.level_description ?? null,
          dosha: data?.dosha ?? null,
        });
      }

      setDidiResp({ state: STATE_INSIGHT[fShort]?.label ?? fShort, insight, reply });
      // Persist the user-facing state for the practices/journey screens
      try {
        localStorage.setItem("restart_checkin_state", fShort.toLowerCase());
        localStorage.setItem("restart_checkin_emotion", fShort.toLowerCase());
        localStorage.setItem("restart_checkin_date", new Date().toDateString());
      } catch {}
      setStep("result");
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't reach Didi — try again?");
      setStep("q2");
    }
  };

  // ---- screens ----
  if (step === "greet") {
    return (
      <div className="phone-frame min-h-screen bg-rs-navy flex flex-col items-center justify-center px-6 text-center">
        <div className="w-32 h-32 rounded-full breathe flex items-center justify-center"
          style={{ background: "radial-gradient(circle, hsla(56,80%,79%,0.45) 0%, transparent 70%)" }}>
          <div className="w-16 h-16 rounded-full bg-rs-cream/40 backdrop-blur-xl pulse-soft" />
        </div>
        <p className="text-white text-[20px] mt-10 font-medium leading-snug min-h-[60px]">
          <Typewriter text={`Hey ${profile?.name?.trim() || "you"}. How are we doing today?`} />
        </p>
        <button onClick={() => setStep("context")} className="mt-10 px-7 py-3 btn-cream flex items-center gap-2">
          Let's go <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => nav(-1)} className="mt-3 text-white/60 text-[12px]">Maybe later</button>
      </div>
    );
  }

  if (step === "context") {
    const chips = [pathChip, chronoChip, roleChip].filter(Boolean);
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="phone-frame min-h-screen px-5 pt-10 pb-10 flex flex-col" style={{ paddingTop: 54 }}>
        <TopBar />
        <div
          style={{
            background: "var(--rs-card)",
            border: "1px solid var(--rs-card-border)",
            borderRadius: 16,
            padding: 20,
          }}
          className="mt-4">
          <p className="text-white text-[15px] font-semibold">Based on what you shared...</p>
          <div className="mt-3 space-y-2">
            {chips.map((c, i) => (
              <div key={i} className="rounded-full px-3 py-2 bg-white/13 border border-white/25 text-white text-[13px]">
                {c}
              </div>
            ))}
          </div>
          <p className="mt-4" style={{ fontSize: 13, fontStyle: "italic", color: "var(--rs-muted)" }}>
            Tell me two things and I'll know exactly what you need.
          </p>
        </div>
        <button onClick={() => setStep("q1")} className="mt-8 w-full py-3.5 btn-cream flex items-center justify-center gap-2">
          Okay, ask me <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="phone-frame min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <Loader2 className="w-8 h-8 text-rs-cream animate-spin mx-auto" />
          <p className="text-white mt-4">Didi is reading your state…</p>
        </div>
      </div>
    );
  }

   if (step === "result" && didiResp) {
     return (
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="phone-frame min-h-screen px-5 pt-10 pb-10" style={{ paddingTop: 54 }}>
         <TopBar />
         <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold">Didi reads</p>
         <h2 className="text-[24px] font-bold text-white mt-1">
           {didiResp.state}{onboardingPath !== "ambitious" ? ` — intensity ${intensity}` : ""}
         </h2>
 
         {/* Brain SVG */}
         <div className="my-7 flex justify-center">
           <svg viewBox="0 0 200 160" className="w-56 h-44" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
             <ellipse cx="100" cy="80" rx="70" ry="55" />
             <path d="M30 80 Q60 40 100 50 T170 80" />
             <path d="M30 80 Q60 120 100 110 T170 80" />
             <circle cx="100" cy="80" r="14" fill="hsl(var(--rs-cream))" opacity="0.85" />
             <circle cx="100" cy="80" r="20" fill="none" stroke="hsl(var(--rs-cream))" opacity="0.4" />
           </svg>
         </div>
 
         <div className="rounded-2xl p-5 bg-white/13 border border-white/25">
           <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">The science</p>
           <p className="text-white text-[14px] leading-relaxed mt-2">{didiResp.insight}</p>
         </div>
 
         <div className="rounded-2xl p-5 bg-rs-cream/15 border border-rs-cream mt-3">
           <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">Didi reads</p>
           <p className="text-white text-[14px] mt-2 leading-relaxed">{didiResp.reply}</p>
           {!isActive && (
             <p className="text-[11px] mt-3 italic text-primary-foreground">
               Note: Showing standard practices. Pro unlocks full personalisation.
             </p>
           )}
         </div>
 
         {/* Recommended practices triad */}
         <div className="mt-5 space-y-3">
           <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold">Your 3 practices</p>
           {(() => {
              const day = parseInt((typeof window !== "undefined" && localStorage.getItem("restart_day")) || "1", 10) || 1;
              const triad = getPracticesForState(feelingKey(feeling).toLowerCase(), day);
              const onboardingAnswers: Record<string, string> = (() => {
                try {
                  const oa = (profile as any)?.onboarding_answers || {};
                  const ls = {
                    support_needed: localStorage.getItem("restart_support_needed") || "",
                    blocker: localStorage.getItem("restart_blocker") || "",
                  };
                  return {
                    ...oa,
                    ...(ls.support_needed ? { support_needed: ls.support_needed } : {}),
                    blocker: blocker || ls.blocker || oa.blocker || "",
                  };
                } catch {
                  return { blocker };
                }
              })();
              const triadFinal = getPracticesForState(feelingKey(feeling).toLowerCase(), day, onboardingAnswers);
              const why = getWhyTodayLabel(day);
              return [triadFinal.neuro, triadFinal.ayurveda, triadFinal.breathwork].map((p) => (
               <div key={p.id} className="rounded-2xl bg-white/13 border border-white/25 p-4">
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-rs-cream text-rs-navy">
                     {p.category}
                   </span>
                   <span className="ml-auto text-[11px] text-rs-cream font-medium">{p.duration}</span>
                 </div>
                 <p className="text-white text-[15px] font-semibold mt-2">{p.name}</p>
                  <p className="text-[12px] mt-1 leading-relaxed text-white/85">{p.description}</p>
                   <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontStyle: "italic", marginTop: 4 }}>{why}</p>
               </div>
             ));
           })()}
         </div>

         <button
           onClick={() => {
             try {
               localStorage.setItem("restart_checkin_state", feelingKey(feeling).toLowerCase());
               localStorage.setItem("restart_checkin_date", new Date().toDateString());
             } catch {}
             nav("/journey");
           }}
           className="w-full mt-6 py-3.5 btn-cream flex items-center justify-center gap-2">
           See today's plan <ArrowRight className="w-4 h-4" />
         </button>
       </motion.div>
     );
   }

  // Q1–2 questionnaire
  const QShell = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="phone-frame min-h-screen px-5 pt-10 pb-10 flex flex-col">
      <h2 className="text-[22px] font-bold text-white">{title}</h2>
      <div className="mt-6 flex-1">{children}</div>
    </motion.div>
  );

  const Pills = ({ items, value, onPick }: { items: string[]; value: string; onPick: (v: string) => void }) => (
    <div className="space-y-2.5">
      {items.map((o) => (
        <button key={o} onClick={() => onPick(o)}
          className={`w-full text-left rounded-xl px-4 py-3.5 btn-press border ${
            value === o ? "bg-rs-cream text-rs-navy font-semibold border-rs-cream" : "bg-white/13 text-white border-white/25"
          }`}>{o}</button>
      ))}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === "q1" && (
        <QShell key="q1" title="Right now I feel...">
          <Pills items={FEELINGS} value={feeling} onPick={(v) => { setFeeling(v); setStep("q2"); }} />
        </QShell>
      )}
      {step === "q2" && onboardingPath === "ambitious" && (
        <QShell key="q2a" title="What's getting in the way right now?">
          <Pills items={AMBITIOUS_BLOCKERS} value={blocker} onPick={(v) => { setBlocker(v); submit(); }} />
        </QShell>
      )}
      {step === "q2" && onboardingPath !== "ambitious" && (
        <QShell key="q2s" title="How intense is this feeling?">
          <div className="mt-12 px-2">
            <input type="range" min={1} max={10} value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-[hsl(var(--rs-cream))]" />
            <div className="flex justify-between text-[11px] text-rs-muted mt-2"><span>1</span><span>10</span></div>
            <p className="text-center text-white text-[16px] mt-6 font-semibold">
              {intensityLabel(intensity)}
            </p>
          </div>
          <button onClick={submit} className="mt-8 w-full py-3.5 btn-cream flex items-center justify-center gap-2">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </QShell>
      )}
    </AnimatePresence>
  );
};
export default CheckInScreen;
