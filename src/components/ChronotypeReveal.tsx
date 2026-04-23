import { ArrowRight } from "lucide-react";
import { CHRONOTYPE_EMOJI, CHRONOTYPE_GRADIENT, CHRONOTYPE_LABEL, type Chronotype } from "@/lib/restartData";

interface Props {
  chronotype: Chronotype;
  headline: string;
  description: string;
  onContinue: () => void;
}

const ChronotypeReveal = ({ chronotype, headline, description, onContinue }: Props) => {
  const dark = chronotype === "wolf";
  const text = dark ? "text-white" : "text-foreground";
  const sub = dark ? "text-white/85" : "text-foreground/75";
  const muted = dark ? "text-white/60" : "text-foreground/55";

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 fade-up"
      style={{ background: CHRONOTYPE_GRADIENT[chronotype] }}>
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm text-center">
        <div className="text-7xl mb-6 bloom" role="img" aria-label={chronotype}>
          {CHRONOTYPE_EMOJI[chronotype]}
        </div>
        <h1 className={`font-serif text-[34px] ${text} mb-3`}>{CHRONOTYPE_LABEL[chronotype]}</h1>
        {headline && (
          <p className={`font-serif italic text-lg ${sub} mb-4 leading-snug`}>{headline}</p>
        )}
        {description && (
          <p className={`text-[15px] font-light ${sub} leading-relaxed mb-8 max-w-[300px]`}>{description}</p>
        )}
        <div className="w-12 h-px bg-accent my-2" />
        <p className={`text-xs uppercase tracking-widest ${muted} mt-4`}>
          This is how reStart will plan your day
        </p>
      </div>

      <button onClick={onContinue}
        className="w-full max-w-sm py-4 rounded-[32px] bg-accent text-foreground font-medium btn-press float-anim flex items-center justify-center gap-2">
        Let's begin <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChronotypeReveal;
