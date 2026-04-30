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
  const [reveal, setReveal] = useState<{ chronotype: Chronotype; headline: string; description: string } | null>(null);

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
      finish(merged);
    } else {
      setIdx(idx + 1);
    }
  };

  const back = () => {
    if (idx === 0) { nav("/"); return; }
    setIdx(idx - 1);
  };

  if (reveal) return <ChronotypeReveal {...reveal} onContinue={() => nav("/home")} />;

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
            <div className="mt-6 space-y-2.5">
              {q.options.map((o) => {
                const selected = answers[q.id] === o;
                return (
                  <button key={o} onClick={() => next(o)}
                    className={`w-full text-left rounded-xl px-4 py-3.5 btn-press transition-all border ${
                      selected
                        ? "bg-rs-cream text-rs-navy font-semibold border-rs-cream"
                        : "bg-white/13 text-white border-white/25 hover:bg-white/20"
                    }`}>
                    <span className="text-[15px]">{o}</span>
                  </button>
                );
              })}
            </div>
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
