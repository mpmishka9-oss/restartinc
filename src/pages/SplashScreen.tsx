import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const SplashScreen = () => {
  const nav = useNavigate();
  const [showPath, setShowPath] = useState(false);
  const showDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true";

  const demoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "restartuser.wolf@gmail.com",
        password: "Restart@2024",
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? "Demo login failed");
    }
  };

  const DemoButton = () =>
    showDemo ? (
      <button
        onClick={demoLogin}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          background: "#FEFFAF",
          color: "#1a1a1a",
          border: "none",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          zIndex: 50,
        }}
      >
        Demo
      </button>
    ) : null;

  useEffect(() => {
    const t = setTimeout(() => setShowPath(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showPath) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="phone-frame min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <DemoButton />
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
      <DemoButton />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
        className="flex flex-col items-center">
        <img src={logo} alt="reStart" style={{ width: 220, objectFit: "contain" }} />
        <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-white/55">Ancient Wisdom · Modern Science</p>
      </motion.div>
    </div>
  );
};
export default SplashScreen;
