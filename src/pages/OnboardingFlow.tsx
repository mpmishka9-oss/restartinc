import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/context/AppContext";
import {
  UNIVERSAL_QUESTIONS, AMBITIOUS_QUESTIONS, STRESSED_QUESTIONS,
  totalOnboardingSteps, type Path, type Question, type Chronotype,
} from "@/lib/restartData";
import ChronotypeReveal from "@/components/onboarding/ChronotypeReveal";
import DidiIntro from "@/components/onboarding/DidiIntro";
import ConsentForm from "@/components/ConsentForm";

const OnboardingFlow = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const app = useApp();

  const path: Path = (loc.state as any)?.path ?? app.path ?? "ambitious";
  useEffect(() => { app.setPath(path); }, [path]);

  const questions = useMemo<Question[]>(() => [
    ...UNIVERSAL_QUESTIONS,
    ...(path === "ambitious" ? AMBITIOUS_QUESTIONS : STRESSED_QUESTIONS),
  ], [path]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [consentStep, setConsentStep] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, string> | null>(null);
  const [reveal, setReveal] = useState<{ chronotype: Chronotype; headline: string; description: string } | null>(null);
  const [showDidiIntro, setShowDidiIntro] = useState(false);

  const q = questions[idx];
  const total = totalOnboardingSteps(path);
  const progress = ((idx + 1) / total) * 100;

  // Pre-fill text when going back
  useEffect(() => { setText(answers[q?.id] ?? ""); }, [idx, q?.id]);

  const finish = async (allAnswers: Record<string, string>) => {
    setAssigning(true);
    try {
      // Save profile data
      if (user) {
        await supabase.from("profiles").update({
          name: allAnswers.name || null,
          age: allAnswers.age || null,
          email: user.email ?? null,
          goal: allAnswers.goal || null,
          path,
          onboarding_answers: allAnswers,
        }).eq("id", user.id);
      }
      app.setOnboardingData({
        name: allAnswers.name, age: allAnswers.age,
        email: user?.email, goal: allAnswers.goal,
      });

      const { data, error } = await supabase.functions.invoke("assign-chronotype", {
        body: { onboarding_answers: allAnswers, path },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const ct = data.chronotype as Chronotype;
      if (user) {
        await supabase.from("profiles").update({
          chronotype: ct,
          chronotype_headline: data.headline,
          chronotype_description: data.description,
          onboarding_completed: true,
          journey_started_at: new Date().toISOString(),
          current_day: 1,
        }).eq("id", user.id);
      }
      app.setOnboardingData({ chronotype: ct });
      setReveal({ chronotype: ct, headline: data.headline, description: data.description });
      setShowDidiIntro(true);
    } catch (e: any) {
      toast.error(e.message ?? "Something felt off — try again?");
      setAssigning(false);
    }
  };

  const next = (val?: string) => {
    const v = val ?? text;
    if (q.type === "text" || q.type === "textarea") {
      if (!v.trim() || (q.type === "textarea" && q.minLength && v.trim().length < q.minLength)) return;
      if (q.id === "email" && !/^\S+@\S+\.\S+$/.test(v.trim())) {
        toast.error("Please enter a valid email"); return;
      }
    }
    const merged = { ...answers, [q.id]: v };
    setAnswers(merged);
    setText("");
    if (idx + 1 >= questions.length) {
      setPendingAnswers(merged);
      setConsentStep(true);
    } else {
      setIdx(idx + 1);
    }
  };

  const back = () => {
    if (idx === 0) { nav("/"); return; }
    setIdx(idx - 1);
  };

  if (reveal && showDidiIntro) {
    return <DidiIntro onContinue={() => setShowDidiIntro(false)} />;
  }
  if (reveal) return <ChronotypeReveal {...reveal} onContinue={() => nav("/home")} />;

  if (consentStep && !assigning) {
    return (
      <ConsentForm
        onAccept={() => {
          setConsentStep(false);
          if (pendingAnswers) finish(pendingAnswers);
        }}
      />
    );
  }

  if (assigning) {
    return (
      <div className="phone-frame min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Loader2 className="w-8 h-8 text-rs-cream animate-spin" />
        <p className="text-white mt-6 text-[16px] font-medium">Reading your rhythm…</p>
        <p className="text-rs-muted text-[13px] mt-2">Didi is mapping your chronotype.</p>
      </div>
    );
  }

  return (
    <div className="phone-frame min-h-screen flex flex-col px-5 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={back} className="p-2 -ml-2 btn-press">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-rs-cream transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[11px] text-rs-muted font-medium">{idx + 1}/{total}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col mt-4">
          <h2 className="text-[22px] font-bold text-white leading-snug">{q.q}</h2>
          {q.sub && <p className="text-[13px] text-rs-muted mt-2">{q.sub}</p>}

          {q.type === "text" && (
            <input
              autoFocus
              type={q.inputType ?? "text"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder}
              onKeyDown={(e) => e.key === "Enter" && next()}
              className="w-full mt-8 border border-white/25 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-rs-cream bg-[rs-bg-dark] bg-muted"
            />
          )}

          {q.type === "textarea" && (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={q.placeholder}
              rows={4}
               className="w-full mt-8 border border-white/25 rounded-xl px-4 py-3.5 text-white placeholder:text-white/40 outline-none focus:border-rs-cream resize-none text-[rs-bg-dark] bg-rs-navy"
            />
          )}

          {q.type === "single" && (
            <SingleAnswer
              qid={q.id}
              options={q.options}
              selected={answers[q.id]}
              onSelect={(o) => next(o)}
            />
          )}

          {(q.type === "text" || q.type === "textarea") && (
            <button onClick={() => next()}
              disabled={!text.trim() || (q.type === "textarea" && q.minLength ? text.trim().length < q.minLength : false)}
              className="mt-8 self-end px-6 py-3 btn-cream flex items-center gap-2 disabled:opacity-40">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
export default OnboardingFlow;

// ---------- Answer presentation helpers ----------

const EMOTION_QUESTIONS = new Set([
  "feeling_word", "energy_today", "feel_about_work",
]);
const ICON_QUESTIONS = new Set([
  "role", "deep_work_time", "work_style", "amb_challenge",
  "blockers", "today_goal", "body_location", "driver",
  "impact", "tried", "support_needed", "origin",
]);
const SPECTRUM_QUESTIONS = new Set([
  "age", "lifestyle", "openness", "clarity", "workload",
  "focus_window", "frequency", "history", "sleep",
]);

const EMOTION_META: Record<string, { emoji: string; tint: string; ring: string }> = {
  "Anxious / worried":          { emoji: "😟", tint: "bg-amber-100",   ring: "ring-amber-300" },
  "Angry / frustrated":         { emoji: "😤", tint: "bg-red-100",     ring: "ring-red-300" },
  "Sad / low":                  { emoji: "😔", tint: "bg-blue-100",    ring: "ring-blue-300" },
  "Overwhelmed / scattered":    { emoji: "😵‍💫", tint: "bg-purple-100", ring: "ring-purple-300" },
  "Stressed / under pressure":  { emoji: "😣", tint: "bg-orange-100",  ring: "ring-orange-300" },
  "Lost / confused":            { emoji: "😕", tint: "bg-slate-100",   ring: "ring-slate-300" },

  "High — ready to go":         { emoji: "⚡️", tint: "bg-yellow-100",  ring: "ring-yellow-300" },
  "Decent — not at my peak":    { emoji: "🙂", tint: "bg-lime-100",    ring: "ring-lime-300" },
  "Low — struggling to start":  { emoji: "😮‍💨", tint: "bg-blue-100",   ring: "ring-blue-300" },
  "Drained — no motivation":    { emoji: "🪫", tint: "bg-slate-100",   ring: "ring-slate-300" },

  "Driven and on it":           { emoji: "🚀", tint: "bg-emerald-100", ring: "ring-emerald-300" },
  "Pressured but pushing through": { emoji: "💪", tint: "bg-amber-100", ring: "ring-amber-300" },
  "Stuck and frustrated":       { emoji: "🧱", tint: "bg-red-100",     ring: "ring-red-300" },
  "Overwhelmed":                { emoji: "🌪", tint: "bg-purple-100",  ring: "ring-purple-300" },
  "Scattered and unfocused":    { emoji: "🌀", tint: "bg-sky-100",     ring: "ring-sky-300" },
};

const ICON_FOR_OPTION = (opt: string) => {
  const o = opt.toLowerCase();
  if (o.includes("student")) return GraduationCap;
  if (o.includes("working professional")) return Briefcase;
  if (o.includes("freelancer") || o.includes("self-employed")) return Laptop;
  if (o.includes("between jobs")) return Search;
  if (o.includes("homemaker") || o.includes("caregiver")) return Home;

  if (o.includes("early morning")) return Sunrise;
  if (o.includes("morning")) return Sun;
  if (o.includes("afternoon")) return CloudSun;
  if (o.includes("evening")) return Sunset;
  if (o.includes("late night") || o.includes("night")) return Moon;

  if (o.includes("deep focus")) return Target;
  if (o.includes("starting and stopping")) return Shuffle;
  if (o.includes("avoiding")) return Cloud;
  if (o.includes("busy")) return Tornado;

  if (o.includes("stomach") || o.includes("gut")) return Flame;
  if (o.includes("head") || o.includes("temples")) return Brain;
  if (o.includes("throat") || o.includes("neck")) return Frown;
  if (o.includes("whole body")) return Sparkles;

  if (o.includes("distract")) return Zap;
  if (o.includes("overthink") || o.includes("perfection")) return Brain;
  if (o.includes("fatigue") || o.includes("low energy")) return Cloud;
  if (o.includes("too many")) return LayoutGrid;
  if (o.includes("direction")) return Compass;

  if (o.includes("nothing")) return X;
  if (o.includes("talking")) return Smile;
  if (o.includes("exercise") || o.includes("movement")) return Zap;
  if (o.includes("breathing") || o.includes("meditation")) return Sparkles;
  if (o.includes("distraction")) return Shuffle;

  return HelpCircle;
};

const SingleAnswer = ({
  qid, options, selected, onSelect,
}: {
  qid: string;
  options: string[];
  selected: string | undefined;
  onSelect: (o: string) => void;
}) => {
  if (EMOTION_QUESTIONS.has(qid)) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3">
        {options.map((o) => {
          const meta = EMOTION_META[o] ?? { emoji: "✨", tint: "bg-white/90", ring: "ring-rs-cream" };
          const isSel = selected === o;
          return (
            <motion.button
              key={o}
              onClick={() => onSelect(o)}
              whileTap={{ scale: 0.97 }}
              animate={isSel ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`relative rounded-2xl p-4 text-left btn-press ${meta.tint} ${
                isSel ? `ring-2 ${meta.ring} shadow-lg` : "ring-1 ring-black/5"
              }`}
            >
              <div className="text-3xl mb-2">{meta.emoji}</div>
              <div className="text-[13px] font-semibold text-rs-navy leading-snug">{o}</div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (ICON_QUESTIONS.has(qid)) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3">
        {options.map((o) => {
          const Icon = ICON_FOR_OPTION(o);
          const isSel = selected === o;
          return (
            <motion.button
              key={o}
              onClick={() => onSelect(o)}
              whileTap={{ scale: 0.97 }}
              animate={isSel ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`rounded-2xl p-4 flex flex-col items-center text-center btn-press border transition-colors ${
                isSel
                  ? "bg-rs-cream text-rs-navy border-rs-cream shadow-lg"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${isSel ? "text-rs-navy" : "text-rs-cream"}`} />
              <div className="text-[13px] font-medium leading-snug">{o}</div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (SPECTRUM_QUESTIONS.has(qid)) {
    const selIdx = options.indexOf(selected ?? "");
    return (
      <div className="mt-6 space-y-2.5">
        {options.map((o, i) => {
          const isSel = i === selIdx;
          return (
            <motion.button
              key={o}
              onClick={() => onSelect(o)}
              whileTap={{ scale: 0.98 }}
              animate={isSel ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`w-full text-left rounded-2xl px-4 py-3.5 btn-press border transition-colors ${
                isSel
                  ? "bg-rs-cream text-rs-navy border-rs-cream shadow-lg font-semibold"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 ${
                  isSel ? "bg-rs-navy text-rs-cream" : "bg-white/20 text-white"
                }`}>
                  {i + 1}
                </span>
                <span className="text-[15px] leading-snug">{o}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Fallback: original pill list with selection animation
  return (
    <div className="mt-6 space-y-2.5">
      {options.map((o) => {
        const isSel = selected === o;
        return (
          <motion.button
            key={o}
            onClick={() => onSelect(o)}
            whileTap={{ scale: 0.98 }}
            animate={isSel ? { scale: 1.04 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={`w-full text-left rounded-xl px-4 py-3.5 btn-press border ${
              isSel
                ? "bg-rs-cream text-rs-navy font-semibold border-rs-cream"
                : "bg-white/13 text-white border-white/25 hover:bg-white/20"
            }`}
          >
            <span className="text-[15px]">{o}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
