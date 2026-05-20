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
import DoshaQuiz from "@/components/onboarding/DoshaQuiz";
import type { Dosha } from "@/data/practices";

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
  const [showDoshaQuiz, setShowDoshaQuiz] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

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
  if (reveal && showDoshaQuiz) {
    return (
      <DoshaQuiz
        onComplete={async (dosha: Dosha) => {
          if (user) {
            await supabase.from("profiles").update({ dosha }).eq("id", user.id);
          }
          setShowDoshaQuiz(false);
          setShowWelcome(true);
        }}
      />
    );
  }
  if (reveal && showWelcome) {
    return (
      <div
        className="phone-frame min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #fdfcb8 0%, #e6d68f 14%, #7B9BD6 55%, #1A2A4A 100%)",
        }}
      >
        <div className="w-full max-w-sm">
          <h1 className="text-[34px] font-bold leading-tight" style={{ color: "#1A2A4A" }}>
            You're in.
          </h1>
          <p className="text-[15px] mt-4 leading-relaxed" style={{ color: "rgba(26,42,74,0.7)" }}>
            This is a free founding cohort.
            <br />Your feedback builds what comes next.
          </p>
          <button
            onClick={() => nav("/journey", { replace: true })}
            className="mt-8 w-full py-3.5 rounded-xl font-bold btn-press inline-flex items-center justify-center gap-2"
            style={{ background: "#1A2A4A", color: "#fdfcb8", fontSize: 15 }}
          >
            Begin my reset <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  if (reveal) return <ChronotypeReveal {...reveal} onContinue={() => setShowDoshaQuiz(true)} />;

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

// Exact-match emoji per option string. Every onboarding option is covered.
const OPTION_EMOJI: Record<string, string> = {
  // AGE
  "Under 18": "🎒", "18–24": "⚡", "25–35": "💼", "36–45": "🌿", "45+": "🌙",
  // SLEEP
  "Sleep well most nights (7–8 hrs)": "😴",
  "Varies a lot, unpredictable": "🌊",
  "Consistently less sleep than I need": "😮‍💨",
  "Struggle to fall or stay asleep": "🌀",
  "Crash hard, wake up exhausted": "🪫",
  // ROLE
  "Student": "📚",
  "Working professional": "💻",
  "Freelancer or self-employed": "🛠️",
  "Between jobs": "🧭",
  "Homemaker or caregiver": "🏠",
  // DEEP WORK TIME
  "Early morning (5–9am)": "🌅",
  "Morning (9am–12pm)": "☀️",
  "Afternoon (12–5pm)": "🌤️",
  "Evening (5–10pm)": "🌆",
  "Late night (10pm+)": "🌙",
  // LIFESTYLE
  "Very structured and routine": "🗓️",
  "Somewhat structured": "📋",
  "Flexible and varied": "🎯",
  "Chaotic": "🌪️",
  "I'm figuring it out": "🧩",
  // OPENNESS
  "Very open — bring it on": "🔥",
  "Somewhat open": "👐",
  "Curious but sceptical": "🤔",
  "Not really my thing": "🛡️",
  // AMBITIOUS — BIGGEST CHALLENGE
  "Distracted / struggling to focus": "🎯",
  "Overworking — can't switch off": "⚙️",
  "Procrastinating more than I'd like": "⏳",
  "Starting strong then losing steam": "📉",
  // ENERGY TODAY
  "High — ready to go": "⚡",
  "Decent — not at my peak": "🙂",
  "Low — struggling to start": "😮‍💨",
  "Drained — no motivation": "🪫",
  // FEEL ABOUT WORK
  "Driven and on it": "🚀",
  "Pressured but pushing through": "💪",
  "Stuck and frustrated": "🧱",
  "Overwhelmed": "🌊",
  "Scattered and unfocused": "🌀",
  // CLARITY
  "Very clear — I know exactly what to do": "🎯",
  "Somewhat clear": "🗺️",
  "Vague — ideas but no plan": "🌫️",
  "No clarity at all": "❓",
  // BLOCKERS
  "Distractions": "📱",
  "Overthinking or perfectionism": "🔁",
  "Low energy or fatigue": "🪫",
  "Too many things at once": "🤹",
  "Lack of clear direction": "🧭",
  // WORK STYLE
  "Deep focus — locked in": "🔒",
  "Starting and stopping": "⚡",
  "Avoiding or delaying": "🌀",
  "Busy but not really progressing": "🐹",
  // WORKLOAD
  "Under control": "✅",
  "Slightly heavy but manageable": "⚖️",
  "Overloaded but still going": "🏋️",
  "Chaotic — no idea where to start": "🌪️",
  // TODAY'S GOAL
  "Complete one specific task": "🎯",
  "Make meaningful progress": "📈",
  "Get organised": "🗂️",
  "Just get started": "👟",
  // FOCUS WINDOW
  "60+ minutes": "🔥",
  "30–60 minutes": "⏱️",
  "10–30 minutes": "⚡",
  "Less than 10 minutes": "💨",
  // STRESSED PATH — FEELING WORD
  "Anxious / worried": "😰",
  "Angry / frustrated": "😤",
  "Sad / low": "😔",
  "Overwhelmed / scattered": "🌊",
  "Stressed / under pressure": "😮‍💨",
  "Lost / confused": "🧭",
  // FREQUENCY
  "Almost every day": "🔁",
  "A few times a week": "📅",
  "Occasionally": "🌤️",
  "It's a recent shift — new for me": "🆕",
  // BODY LOCATION
  "Stomach / gut": "🫁",
  "Head / temples": "🧠",
  "Throat / neck": "😮‍💨",
  "Whole body / everywhere": "🌊",
  "I don't feel it physically": "🤷",
  // ORIGIN
  "A specific event triggered it": "⚡",
  "Slow build-up over time": "🌡️",
  "It comes in cycles": "🔁",
  "No idea where it started": "❓",
  // DRIVER
  "Work / studies": "💼",
  "A relationship or person": "💔",
  "My own thoughts about myself": "🪞",
  "Nothing specific — it just is": "🌫️",
  "Multiple things at once": "🤹",
  // IMPACT
  "Can't focus or concentrate": "🎯",
  "Withdrawing / isolating": "🚪",
  "Physical symptoms (headache, tension)": "🫀",
  "Spiralling thoughts": "🌀",
  "Going through the motions": "🤖",
  // HISTORY
  "Yes — very familiar, comes back often": "🔁",
  "Yes but usually milder": "📉",
  "Rarely — this feels unusual for me": "🆕",
  "No — this is completely new": "❗",
  // TRIED
  "Nothing yet": "🤷",
  "Talking to someone": "💬",
  "Exercise or movement": "🏃",
  "Breathing / meditation": "🫁",
  "Distraction (scrolling, music)": "📱",
  // SUPPORT NEEDED
  "Something physical I can do": "🏃",
  "Something to think through mentally": "🧠",
  "A calming practice or ritual": "🕯️",
  "Something quick — under 5 minutes": "⚡",
  "Something tonight before sleep": "🌙",
};

const EMOTION_TINT: Record<string, { tint: string; ring: string }> = {
  "Anxious / worried":          { tint: "bg-amber-100",   ring: "ring-amber-300" },
  "Angry / frustrated":         { tint: "bg-red-100",     ring: "ring-red-300" },
  "Sad / low":                  { tint: "bg-blue-100",    ring: "ring-blue-300" },
  "Overwhelmed / scattered":    { tint: "bg-purple-100",  ring: "ring-purple-300" },
  "Stressed / under pressure":  { tint: "bg-orange-100",  ring: "ring-orange-300" },
  "Lost / confused":            { tint: "bg-slate-100",   ring: "ring-slate-300" },
  "High — ready to go":         { tint: "bg-yellow-100",  ring: "ring-yellow-300" },
  "Decent — not at my peak":    { tint: "bg-lime-100",    ring: "ring-lime-300" },
  "Low — struggling to start":  { tint: "bg-blue-100",    ring: "ring-blue-300" },
  "Drained — no motivation":    { tint: "bg-slate-100",   ring: "ring-slate-300" },
  "Driven and on it":           { tint: "bg-emerald-100", ring: "ring-emerald-300" },
  "Pressured but pushing through": { tint: "bg-amber-100", ring: "ring-amber-300" },
  "Stuck and frustrated":       { tint: "bg-red-100",     ring: "ring-red-300" },
  "Overwhelmed":                { tint: "bg-purple-100",  ring: "ring-purple-300" },
  "Scattered and unfocused":    { tint: "bg-sky-100",     ring: "ring-sky-300" },
};

const emojiFor = (opt: string): string => OPTION_EMOJI[opt] ?? "✨";

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
          const tint = EMOTION_TINT[o] ?? { tint: "bg-white/90", ring: "ring-rs-cream" };
          const isSel = selected === o;
          return (
            <motion.button
              key={o}
              onClick={() => onSelect(o)}
              whileTap={{ scale: 0.97 }}
              animate={isSel ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`relative rounded-2xl p-4 text-left btn-press ${tint.tint} ${
                isSel ? `ring-2 ${tint.ring} shadow-lg` : "ring-1 ring-black/5"
              }`}
            >
              <div className="text-3xl mb-2">{emojiFor(o)}</div>
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
              <div className="text-3xl mb-2 leading-none">{emojiFor(o)}</div>
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
