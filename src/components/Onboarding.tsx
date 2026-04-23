import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { UNIVERSAL_QUESTIONS, AMBITIOUS_QUESTIONS, EMOTIONAL_QUESTIONS, type Path, type Question } from "@/lib/restartData";

interface Props {
  path: Path;
  onComplete: (answers: Record<string, any>, name: string, email: string) => void;
}

const Onboarding = ({ path, onComplete }: Props) => {
  const all = useMemo<Question[]>(() => [
    ...UNIVERSAL_QUESTIONS,
    ...(path === "ambitious" ? AMBITIOUS_QUESTIONS : EMOTIONAL_QUESTIONS),
  ], [path]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [textInput, setTextInput] = useState("");
  const [multi, setMulti] = useState<string[]>([]);

  const q = all[idx];
  const progress = ((idx + 1) / all.length) * 100;

  const next = (val?: any) => {
    const v = val ?? (q.type === "multi" ? multi : textInput);
    const newAnswers = { ...answers, [q.id]: v };
    setAnswers(newAnswers);
    setTextInput(""); setMulti([]);
    if (idx + 1 >= all.length) {
      onComplete(newAnswers, newAnswers.name ?? "", newAnswers.email ?? "");
    } else {
      setIdx(idx + 1);
    }
  };

  const canContinue =
    q.type === "text" ? textInput.trim().length > 0 :
    q.type === "multi" ? multi.length > 0 : true;

  const toggleMulti = (o: string) => setMulti(m => m.includes(o) ? m.filter(x => x !== o) : [...m, o]);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-app">
      {/* Progress */}
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="h-[3px] flex-1 bg-primary/15 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="ml-3 text-[11px] text-muted-foreground font-light">{idx + 1} of {all.length}</span>
        </div>
      </div>

      <div key={q.id} className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center fade-up">
        <div className="glass rounded-[20px] p-7">
          <h2 className="font-serif text-2xl text-foreground leading-snug">{q.q}</h2>
          {q.sub && <p className="text-sm text-muted-foreground mt-2 font-light">{q.sub}</p>}

          {q.type === "text" && (
            <input
              type={q.inputType ?? "text"}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={q.placeholder}
              className="w-full mt-6 bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-lg text-foreground placeholder:text-primary/40"
              autoFocus
            />
          )}

          {(q.type === "single" || q.type === "multi") && (
            <div className="mt-6 space-y-2.5">
              {q.options.map(o => {
                const selected = q.type === "multi" ? multi.includes(o) : false;
                return (
                  <button
                    key={o}
                    onClick={() => q.type === "multi" ? toggleMulti(o) : next(o)}
                    className={`w-full text-left px-5 py-3 rounded-[14px] btn-press border transition-all flex items-center justify-between ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "glass-strong text-foreground border-transparent hover:border-primary/30"
                    }`}
                  >
                    <span className="text-sm">{o}</span>
                    {selected && <Check className="w-4 h-4 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {(q.type === "text" || q.type === "multi") && (
          <button
            onClick={() => next()}
            disabled={!canContinue}
            className="mt-6 self-end px-7 py-3 rounded-[16px] bg-accent text-foreground font-medium btn-press flex items-center gap-2 disabled:opacity-40"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
