import { ArrowRight } from "lucide-react";
import type { Chronotype } from "@/lib/chronotype";

const EMOJI: Record<Chronotype, string> = {
  Lion: "🦁", Bear: "🐻", Owl: "🦉", Dolphin: "🐬",
};

interface Props {
  chronotype: Chronotype;
  headline: string;
  description: string;
  onContinue: () => void;
}

const ChronotypeReveal = ({ chronotype, headline, description, onContinue }: Props) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <div className="text-7xl mb-6 animate-in fade-in zoom-in-50 duration-700" role="img" aria-label={chronotype}>
          {EMOJI[chronotype]}
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">{chronotype}</h1>
        {headline && (
          <p className="text-base font-medium text-primary-foreground mb-4 leading-snug">{headline}</p>
        )}
        {description && (
          <p className="text-sm text-foreground/90 leading-relaxed mb-8">{description}</p>
        )}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          This is how Restart will plan your day
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-sm py-4 rounded-2xl bg-foreground text-primary-foreground font-semibold text-base shadow-lg hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        Let's begin
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChronotypeReveal;