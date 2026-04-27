import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const FEELINGS = ["Anxious", "Stressed", "Low", "Overwhelmed", "Focused", "Good", "Energised", "Numb"];
const SOURCES = ["Work", "Relationships", "My own mind", "Body", "External events", "Not sure"];
const NEEDS = ["Something to calm me", "Something to energise me", "Help focusing", "To understand what I'm feeling", "Just to be seen"];

const STATE_INSIGHT: Record<string, { label: string; insight: string; region: string }> = {
  Anxious: { label: "Anxious", insight: "Your amygdala is firing. A long exhale signals safety to your nervous system within 90 seconds.", region: "amygdala" },
  Stressed: { label: "Stressed", insight: "Cortisol is up. A 2-minute physiological sigh resets your CO₂ and pulls you out of fight-or-flight.", region: "amygdala" },
  Low: { label: "Low", insight: "Dopamine is low. A small completed action — even 4 minutes of movement — restarts the reward circuit.", region: "ventral_striatum" },
  Overwhelmed: { label: "Overwhelmed", insight: "Your prefrontal cortex is overloaded. Single-sense focus narrows the field and brings the PFC back online.", region: "pfc" },
  Focused: { label: "Focused", insight: "You're in flow. Protect this state — no notifications, no context switches.", region: "pfc" },
  Good: { label: "Good", insight: "Use this energy to build a habit. Identity rewriting locks in change when mood is positive.", region: "default_mode" },
  Energised: { label: "Energised", insight: "Norepinephrine is high. This is your window for hard tasks — front-load the difficult thing.", region: "lc" },
  Numb: { label: "Numb", insight: "Your nervous system is in shutdown. Cold water on your wrists or neck restores arousal in seconds.", region: "vagus" },
};

type Step = "greet" | "q1" | "q2" | "q3" | "q4" | "submitting" | "result";

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
  const [step, setStep] = useState<Step>("greet");
  const [feeling, setFeeling] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [source, setSource] = useState("");
  const [need, setNeed] = useState("");
  const [didiResp, setDidiResp] = useState<{ state: string; insight: string; reply: string } | null>(null);

  const submit = async () => {
    setStep("submitting");
    try {
      // Map UI feeling → DB enum detected_state
      const map: Record<string, string> = {
        Anxious: "anxiety", Stressed: "stress", Low: "burnout",
        Overwhelmed: "overwhelm", Focused: "peak", Good: "peak", Energised: "peak", Numb: "burnout",
      };
      const detected = map[feeling] ?? "stress";
      const message = `Feeling ${feeling.toLowerCase()} (intensity ${intensity}/10). Source: ${source}. Need: ${need}.`;

      const { data, error } = await supabase.functions.invoke("check-in", {
        body: {
          message,
          path: profile?.path ?? "emotional",
          chronotype: profile?.chronotype ?? "bear",
        },
      });
      if (error) throw error;

      const insight = STATE_INSIGHT[feeling]?.insight ?? "";
      const reply = data?.didi_response ?? "I hear you. Let's move gently from here.";
      const dState = data?.detected_state ?? detected;

      // Save check-in
      if (user) {
        await supabase.from("check_ins").insert({
          user_id: user.id,
          detected_state: dState as any,
          severity_score: intensity,
          assigned_level: data?.assigned_level ?? 1,
          message, didi_response: reply,
          level_description: data?.level_description ?? null,
          dosha: data?.dosha ?? null,
        });
      }

      setDidiResp({ state: STATE_INSIGHT[feeling]?.label ?? feeling, insight, reply });
      setStep("result");
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't reach Didi — try again?");
      setStep("q4");
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
        <button onClick={() => setStep("q1")} className="mt-10 px-7 py-3 btn-cream flex items-center gap-2">
          Let's go <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => nav(-1)} className="mt-3 text-white/60 text-[12px]">Maybe later</button>
      </div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="phone-frame min-h-screen px-5 pt-10 pb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold">Didi reads</p>
        <h2 className="text-[24px] font-bold text-white mt-1">{didiResp.state} — intensity {intensity}</h2>

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
          <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">Didi says</p>
          <p className="text-white text-[14px] mt-2 leading-relaxed">{didiResp.reply}</p>
        </div>

        <button onClick={() => nav("/practices")} className="w-full mt-6 py-3.5 btn-cream flex items-center justify-center gap-2">
          See my practices <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // Q1–4 questionnaire
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
      {step === "q2" && (
        <QShell key="q2" title="The intensity is...">
          <div className="mt-12 px-2">
            <input type="range" min={1} max={10} value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-[hsl(var(--rs-cream))]" />
            <div className="flex justify-between text-[11px] text-rs-muted mt-2"><span>1</span><span>10</span></div>
            <p className="text-center text-white text-[16px] mt-6 font-semibold">
              {intensity <= 3 ? "Barely there" : intensity <= 6 ? "Noticeable" : intensity <= 8 ? "Strong" : "Overwhelming"} — {intensity}/10
            </p>
          </div>
          <button onClick={() => setStep("q3")} className="mt-8 w-full py-3.5 btn-cream flex items-center justify-center gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </QShell>
      )}
      {step === "q3" && (
        <QShell key="q3" title="This is mainly coming from...">
          <Pills items={SOURCES} value={source} onPick={(v) => { setSource(v); setStep("q4"); }} />
        </QShell>
      )}
      {step === "q4" && (
        <QShell key="q4" title="What I need right now is...">
          <Pills items={NEEDS} value={need} onPick={(v) => { setNeed(v); submit(); }} />
        </QShell>
      )}
    </AnimatePresence>
  );
};
export default CheckInScreen;
