import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  CHRONOTYPE_EMOJI, CHRONOTYPE_LABEL, CHRONOTYPE_TAGLINE, type Chronotype,
} from "@/lib/restartData";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import Mandala from "@/components/home/Mandala";
import { getCompletedPracticesCount, TOTAL_PRACTICES } from "@/lib/dayProgression";

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const ct = profile?.chronotype as Chronotype | null;
  const day = profile?.current_day ?? 1;
  const [practicesDone, setPracticesDone] = useState(
    Math.min(TOTAL_PRACTICES, getCompletedPracticesCount())
  );
  useEffect(() => {
    const refresh = () =>
      setPracticesDone(Math.min(TOTAL_PRACTICES, getCompletedPracticesCount()));
    refresh();
    window.addEventListener("restart:practice-completed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("restart:practice-completed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-5 pt-10 pb-28" style={{ paddingTop: 54 }}>
      <TopBar />
      <h1 className="text-[24px] font-bold text-white text-rs-navy">Profile</h1>

      <div className="mt-6 rounded-2xl p-6 bg-white/13 border border-white/25 text-center">
        {ct && (
          <>
            <div className="text-[64px] leading-none">{CHRONOTYPE_EMOJI[ct]}</div>
            <h2 className="text-white text-[22px] font-bold mt-2">{CHRONOTYPE_LABEL[ct]}</h2>
            <p className="text-rs-muted text-[13px] mt-1">{CHRONOTYPE_TAGLINE[ct]}</p>
          </>
        )}
        {!ct && <p className="text-rs-muted text-[14px]">Complete onboarding to see your chronotype.</p>}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Day" value={`${day} / 3`} />
        <Stat label="Practices" value={`${practicesDone} / ${TOTAL_PRACTICES}`} />
        <Stat label="Path" value={profile?.path === "ambitious" ? "Ambitious" : profile?.path === "emotional" ? "Stressed" : "—"} />
      </div>

      <div className="mt-6 flex flex-col items-center">
        <Mandala day={day} size={140} />
        <p className="text-rs-muted text-[12px] mt-2">Your inner garden</p>
      </div>

      <button onClick={signOut}
        className="w-full mt-8 py-3 btn-outline-white inline-flex items-center justify-center gap-2 text-[14px] text-rs-navy">
        <LogOut className="w-4 h-4" /> Sign out
      </button>

      <BottomNav />
    </motion.div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl p-4 bg-white/8 border border-white/20">
    <p className="text-rs-muted text-[10px] tracking-[0.16em] uppercase font-semibold">{label}</p>
    <p className="text-white text-[18px] font-bold mt-1">{value}</p>
  </div>
);

export default ProfileScreen;
