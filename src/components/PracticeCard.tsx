import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { CHRONOTYPE_TIMING, type Chronotype } from "@/lib/restartData";

type Practice = Tables<"practices">;

interface Props {
  practice: Practice;
  level: 1 | 2 | 3;
  chronotype?: Chronotype | null;
  defaultOpen?: boolean;
}

const PracticeCard = ({ practice, level, chronotype, defaultOpen = false }: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const isNeuro = practice.system === "neuro";
  const isPeak = practice.system === "peak";
  const accentBar = isNeuro ? "bg-primary" : isPeak ? "bg-accent" : "bg-sage";
  const badge = isNeuro ? "Neuro" : isPeak ? "Peak" : "Ayurveda";
  const instructions = level === 1 ? practice.level_1 : level === 2 ? practice.level_2 : practice.level_3;
  const timing = chronotype ? CHRONOTYPE_TIMING[chronotype] : null;

  return (
    <div className="glass rounded-[16px] overflow-hidden flex">
      <div className={`w-1 ${accentBar} flex-shrink-0`} />
      <button onClick={() => setOpen(!open)} className="flex-1 text-left btn-press">
        <div className="p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-primary-deep">{badge}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
              <Clock className="w-3 h-3" />{practice.duration_mins} min
            </span>
          </div>
          <h4 className="font-serif text-[15px] text-foreground leading-snug">{practice.title}</h4>
          {timing && (
            <p className="font-serif italic text-[12px] text-primary-deep mt-1">
              {timing.label}{timing.alt ? ` · ${timing.alt}` : ""}
            </p>
          )}
          {open && (
            <div className="mt-3 fade-up space-y-2">
              <p className="text-[12px] text-foreground/60 italic font-light">Why this works: {practice.why_it_works}</p>
              <p className="text-[13px] text-foreground/85 font-light leading-relaxed whitespace-pre-wrap">{instructions}</p>
            </div>
          )}
          <div className="flex justify-end mt-2">
            <ChevronDown className={`w-4 h-4 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>
    </div>
  );
};

export default PracticeCard;
