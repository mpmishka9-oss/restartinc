import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Shield, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { greetingFor, getDayPhrase, CHRONOTYPE_EMOJI, CHRONOTYPE_LABEL, type Chronotype } from "@/lib/restartData";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import Mandala from "@/components/home/Mandala";
import { useSubscription } from "@/hooks/useSubscription";

const HomeScreen = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { isPastDue } = useSubscription();
  const [todayChecked, setTodayChecked] = useState<boolean | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const start = new Date(); start.setHours(0,0,0,0);
      const { data } = await supabase.from("check_ins").select("detected_state")
        .eq("user_id", user.id).gte("created_at", start.toISOString())
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      setTodayChecked(!!data);
      setDetectedState(data?.detected_state ?? null);
    })();
  }, [user]);

  const day = profile?.current_day ?? 1;
  const streak = profile?.streak_days ?? 0;
  const ct = profile?.chronotype as Chronotype | null;

  if (loading) {
    return (
      <div className="phone-frame min-h-screen flex items-center justify-center">
        <div className="dot-loader"><span/><span/><span/></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="phone-frame min-h-screen pb-28" style={{ paddingTop: 44 }}>
      <TopBar />
      <div className="px-5 pt-10">
        {isPastDue && (
          <div className="mb-4 rounded-xl p-3 bg-amber-500/15 border border-amber-400/40 text-amber-100 text-[13px]">
            Your last payment didn't go through. We're retrying — please update your payment method to keep your access.
            <button onClick={() => nav("/pricing")} className="block mt-1 underline text-amber-50">Manage billing →</button>
          </div>
        )}
        {/* Greeting */}
        <h1 className="text-[24px] font-bold text-white">{greetingFor(profile?.name)}</h1>
        <p className="text-[14px] text-rs-muted mt-1">{getDayPhrase(day)}</p>

        {/* Streak */}
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/13 border border-white/25 text-white text-[12px] font-semibold">
            <Flame className="w-3.5 h-3.5 text-rs-cream" /> {streak} day streak
          </span>
          {day >= 8 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/13 border border-white/25 text-white text-[11px]">
              <Shield className="w-3 h-3 text-rs-cream" /> Grace day available
            </span>
          )}
          {ct && (
            <span className="text-[12px] text-rs-muted ml-auto">
              {CHRONOTYPE_EMOJI[ct]} {CHRONOTYPE_LABEL[ct]}
            </span>
          )}
        </div>

        {/* Mandala */}
        <div className="flex flex-col items-center my-7">
          <Mandala day={day} size={140} />
          <p className="text-[12px] text-rs-muted mt-2">Day {day} of your reset</p>
        </div>

        {/* Daily Loop card */}
        <div className="rounded-2xl p-5 bg-white/13 border border-white/25">
          <p className="text-[10px] tracking-[0.18em] uppercase text-rs-cream font-semibold">Today's check-in</p>

          {!todayChecked ? (
            <>
              <p className="text-white text-[16px] mt-2 leading-snug">
                Didi is here. A few breaths, a few questions — then your practices unlock.
              </p>
              <button onClick={() => nav("/checkin")}
                className="w-full mt-4 py-3.5 btn-cream flex items-center justify-center gap-2 bg-[rs-bg-dark] bg-rs-bg">
                Check in with Didi <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-rs-cream/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-rs-cream" />
                </div>
                <p className="text-white text-[15px]">You've checked in today.</p>
              </div>
              {detectedState && (
                <div className="mt-3">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-rs-muted">State detected</p>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-rs-cream/20 text-white text-[12px] capitalize">{detectedState}</span>
                </div>
              )}
              <button onClick={() => nav("/practices")}
                className="w-full mt-4 py-3 btn-outline-white flex items-center justify-center gap-2">
                See today's practices <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => nav("/journey")}
                className="w-full mt-2 py-3 text-rs-cream text-[13px] font-medium underline-offset-4 hover:underline">
                3-day plan ready →
              </button>
              <p className="text-rs-muted text-[12px] italic mt-4 text-center">Tomorrow: a deeper ritual to ground your evening.</p>
            </>
          )}
        </div>

        {/* Day-18 nudge */}
        {day >= 18 && day <= 21 && (
          <button onClick={() => nav("/pricing")}
            className="w-full mt-4 rounded-xl p-4 text-left bg-rs-cream/15 border border-rs-cream text-white text-[13px]">
            Your reset ends in {22 - day} days. See what continuing looks like →
          </button>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
};
export default HomeScreen;
