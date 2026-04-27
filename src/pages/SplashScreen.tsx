import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SplashScreen = () => {
  const nav = useNavigate();
  const [showPath, setShowPath] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowPath(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showPath) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="phone-frame min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <h1 className="text-[22px] font-bold text-white text-center">How are you arriving today?</h1>
        <p className="text-[14px] text-rs-muted text-center mt-2">This shapes your entire experience.</p>

        <div className="w-full mt-10 space-y-4">
          <button onClick={() => nav("/onboarding", { state: { path: "ambitious" } })}
            className="w-full text-left rounded-2xl p-5 btn-press transition-colors"
            style={{ background: "rgba(245, 240, 160, 0.15)", border: "1.5px solid hsl(var(--rs-cream))" }}>
            <div className="text-3xl mb-2">🧠</div>
            <div className="text-[17px] font-bold text-white">I want to perform</div>
            <div className="text-[13px] text-rs-muted mt-1">Focus & peak output</div>
          </button>

          <button onClick={() => nav("/onboarding", { state: { path: "emotional" } })}
            className="w-full text-left rounded-2xl p-5 btn-press transition-colors"
            style={{ background: "rgba(29, 158, 117, 0.15)", border: "1.5px solid hsl(var(--rs-green))" }}>
            <div className="text-3xl mb-2">🌿</div>
            <div className="text-[17px] font-bold text-white">Life's a bit much</div>
            <div className="text-[13px] text-rs-muted mt-1">Stress, burnout, anxiety</div>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="phone-frame min-h-screen flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
        className="flex flex-col items-center">
        <svg viewBox="0 0 64 64" className="w-14 h-14 mb-4 opacity-90" fill="none" stroke="hsl(var(--rs-cream))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M32 12c-8 0-14 6-14 14 0 4 2 7 4 9-2 2-3 5-3 8 0 6 6 11 13 11s13-5 13-11c0-3-1-6-3-8 2-2 4-5 4-9 0-8-6-14-14-14z" />
          <path d="M32 18v28M22 28h20M22 38h20" opacity="0.5" />
        </svg>
        <h1 className="font-serif italic text-[56px] leading-none font-bold text-rs-cream">reStart</h1>
        <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-white/55">Ancient Wisdom · Modern Science</p>
      </motion.div>
    </div>
  );
};
export default SplashScreen;
