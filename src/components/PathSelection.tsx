import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Path } from "@/lib/restartData";
import logo from "@/assets/restart-logo.png";

const PathSelection = ({ onSelect }: { onSelect: (p: Path) => void }) => {
  const [path, setPath] = useState<Path | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-soft-gradient">
      <img src={logo} alt="reStart" className="w-20 h-20 object-contain mb-6" />
      <h1 className="font-serif text-white text-[28px] text-center leading-tight">How are you arriving today?</h1>
      <p className="text-white/80 text-sm mt-2 text-center max-w-xs">This shapes everything Didi prepares for you</p>

      <div className="w-full max-w-md mt-10 space-y-4">
        {[
          { id: "ambitious" as Path, emoji: "🧠", title: "I want to perform", sub: "Focus, clarity and peak output" },
          { id: "emotional" as Path, emoji: "🌿", title: "Life's a bit much", sub: "Support for when things feel heavy" },
        ].map(c => {
          const active = path === c.id;
          return (
            <button key={c.id} onClick={() => setPath(c.id)}
              className={`w-full glass rounded-[20px] p-6 text-left btn-press transition-all ${active ? "ring-2 ring-accent shadow-[0_0_24px_hsl(60_100%_84%/0.6)]" : "hover:scale-[1.01]"}`}
              style={{ transform: active ? "scale(1.03)" : undefined }}>
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-serif text-xl text-foreground">{c.title}</h3>
              <p className="text-sm text-muted-foreground font-light mt-1">{c.sub}</p>
            </button>
          );
        })}
      </div>

      {path && (
        <button onClick={() => onSelect(path)}
          className="mt-8 px-8 py-3.5 rounded-[16px] bg-accent text-foreground font-medium btn-press pulse-soft fade-up flex items-center gap-2">
          Let's begin <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PathSelection;
