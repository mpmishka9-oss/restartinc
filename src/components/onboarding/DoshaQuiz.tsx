import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  DOSHA_QUIZ, DOSHA_QUIZ_INTRO, DOSHA_RESULT_COPY,
  scoreDoshaQuiz, type Dosha,
} from "@/data/practices";
import BackButton from "@/components/onboarding/BackButton";

interface Props {
  onComplete: (dosha: Dosha) => void | Promise<void>;
  onBack?: () => void;
}

const DoshaQuiz = ({ onComplete, onBack }: Props) => {
  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Dosha[]>([]);
  const [result, setResult] = useState<Dosha | null>(null);
  const [saving, setSaving] = useState(false);

  if (stage === "intro") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="phone-frame min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        {onBack && <BackButton onClick={onBack} className="absolute top-4 left-4" />}
        <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold">Step 2 of 2</p>
        <h1 className="text-[28px] font-bold text-white mt-3 leading-tight">{DOSHA_QUIZ_INTRO.title}</h1>
        <p className="text-rs-muted text-[14px] mt-3 max-w-xs leading-relaxed">{DOSHA_QUIZ_INTRO.subtitle}</p>
        <button onClick={() => setStage("quiz")}
          className="mt-10 px-7 py-3.5 btn-cream inline-flex items-center gap-2">
          {DOSHA_QUIZ_INTRO.ctaLabel}
        </button>
      </motion.div>
    );
  }

  if (stage === "result" && result) {
    const copy = DOSHA_RESULT_COPY[result];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="phone-frame min-h-screen flex flex-col px-6 py-10 relative">
        <BackButton
          onClick={() => { setResult(null); setAnswers(answers.slice(0, -1)); setIdx(Math.max(0, DOSHA_QUIZ.length - 1)); setStage("quiz"); }}
          className="absolute top-4 left-4"
        />
        <div className="flex-1 flex flex-col justify-center text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-rs-cream font-semibold">Your dosha</p>
          <h1 className="text-[30px] font-bold text-white mt-3">{copy.headline}</h1>
          <p className="text-rs-muted text-[14px] mt-4 leading-relaxed">{copy.description}</p>
        </div>
        <button
          disabled={saving}
          onClick={async () => { setSaving(true); await onComplete(result); }}
          className="w-full py-3.5 btn-cream flex items-center justify-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
        </button>
      </motion.div>
    );
  }

  const q = DOSHA_QUIZ[idx];
  const progress = ((idx + 1) / DOSHA_QUIZ.length) * 100;

  const pick = (d: Dosha) => {
    const next = [...answers, d];
    setAnswers(next);
    if (idx + 1 >= DOSHA_QUIZ.length) {
      setResult(scoreDoshaQuiz(next));
      setStage("result");
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <div className="phone-frame min-h-screen flex flex-col px-5 py-6">
      <div className="flex items-center gap-3 mb-4">
        <BackButton
          onClick={() => {
            if (idx === 0) { setStage("intro"); return; }
            setAnswers(answers.slice(0, -1));
            setIdx(idx - 1);
          }}
          className="-ml-1"
        />
        <div className="flex-1 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-rs-cream transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[11px] text-rs-muted font-medium">{idx + 1}/{DOSHA_QUIZ.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col mt-4">
          <h2 className="text-[22px] font-bold text-white leading-snug">{q.question}</h2>
          <div className="mt-6 space-y-3">
            {q.options.map((o) => (
              <motion.button key={o.label}
                onClick={() => pick(o.scoresFor)}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left rounded-2xl px-4 py-4 btn-press border bg-white/10 text-white border-white/20 hover:bg-white/15">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 bg-white/20 text-white">
                    {o.label}
                  </span>
                  <span className="text-[15px] leading-snug">{o.text}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DoshaQuiz;
