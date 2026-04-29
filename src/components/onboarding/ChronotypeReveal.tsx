import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  type Chronotype, CHRONOTYPE_EMOJI, CHRONOTYPE_LABEL,
  CHRONOTYPE_TAGLINE, CHRONOTYPE_STRENGTH, CHRONOTYPE_CHALLENGE,
  CHRONOTYPE_HERO_BG, CHRONOTYPE_HERO_TEXT,
} from "@/lib/restartData";
import { useApp } from "@/context/AppContext";

interface Props {
  chronotype: Chronotype;
  headline: string;
  description: string;
  onContinue: () => void;
}

const ChronotypeReveal = ({ chronotype, headline, description, onContinue }: Props) => {
  const { name } = useApp();
  const heroBg = CHRONOTYPE_HERO_BG[chronotype];
  const heroText = CHRONOTYPE_HERO_TEXT[chronotype];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="phone-frame min-h-screen flex flex-col">
      {/* Hero */}
      <div className="px-6 pt-12 pb-8 text-center bg-[rs-bg-dark]" style={{ background: heroBg, color: heroText }}>
        <p className="text-[10px] tracking-[0.2em] uppercase opacity-70 font-semibold">Your chronotype</p>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-[80px] my-3 leading-none">
          {CHRONOTYPE_EMOJI[chronotype]}
        </motion.div>
        <h1 className="text-[28px] font-bold">{CHRONOTYPE_LABEL[chronotype]}</h1>
        <p className="text-[14px] mt-2 opacity-80 leading-snug">{CHRONOTYPE_TAGLINE[chronotype]}</p>
        {headline && <p className="text-[13px] italic mt-3 opacity-70">"{headline}"</p>}
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-6 space-y-3">
        {description && (
          <p className="text-white text-[14px] leading-relaxed text-center px-2">{description}</p>
        )}

        <div className="rounded-2xl p-5 bg-white/13 border border-white/25 mt-4">
          <p className="text-[10px] tracking-[0.18em] uppercase text-rs-cream font-semibold mb-2">Your strength</p>
          <p className="text-white text-[14px] leading-relaxed">{CHRONOTYPE_STRENGTH[chronotype]}</p>
        </div>

        <div className="rounded-2xl p-5 bg-white/13 border border-white/25">
          <p className="text-[10px] tracking-[0.18em] uppercase text-rs-cream font-semibold mb-2">Your challenge</p>
          <p className="text-white text-[14px] leading-relaxed">{CHRONOTYPE_CHALLENGE[chronotype]}</p>
        </div>

        <p className="text-center text-rs-muted text-[13px] italic mt-6 px-2">
          Your plan has been personalised for your type{name ? `, ${name}` : ""}.
        </p>

        <button onClick={onContinue}
          className="w-full mt-4 py-3.5 btn-cream flex items-center justify-center gap-2">
          Start my reset <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
export default ChronotypeReveal;
