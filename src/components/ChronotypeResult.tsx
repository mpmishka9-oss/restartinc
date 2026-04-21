import { CHRONOTYPE_INFO, type Chronotype } from "@/lib/chronotype";

interface ChronotypeResultProps {
  chronotype: Chronotype;
  name?: string;
}

const ChronotypeResult = ({ chronotype, name }: ChronotypeResultProps) => {
  const info = CHRONOTYPE_INFO[chronotype];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center mb-6 border border-border/50">
          <span className="text-3xl" role="img" aria-label={chronotype}>{info.emoji}</span>
        </div>

        {name && (
          <p className="text-sm text-foreground/80 mb-2">For you, {name}</p>
        )}

        <h1 className="text-3xl font-bold text-foreground text-center mb-3">
          You're a {chronotype}
        </h1>

        <p className="text-sm text-foreground/90 text-center leading-relaxed mb-8">
          {info.tagline}
        </p>

        <div className="w-full bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 mb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your strength</p>
          <p className="text-sm text-foreground font-medium">{info.strength}</p>
        </div>

        <div className="w-full bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 mb-8">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Watch out for</p>
          <p className="text-sm text-foreground font-medium">{info.challenge}</p>
        </div>

        <p className="text-sm text-foreground/90 text-center font-medium">
          Your plan has been personalised for your type ✨
        </p>
      </div>
    </div>
  );
};

export default ChronotypeResult;
