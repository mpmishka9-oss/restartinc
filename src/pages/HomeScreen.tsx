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
import { ADMIN_EMAIL, startInvestorDemo, isInvestorDemoActive } from "@/lib/investorDemo";
import { toast } from "sonner";
const HomeScreen = () => {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
   const { profile, loading } = useProfile();
  const [todayChecked, setTodayChecked] = useState<boolean | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const isAdmin = (user?.email ?? "").toLowerCase() === ADMIN_EMAIL;
  const demoActive = isInvestorDemoActive();
  const [doshaPromptDismissed, setDoshaPromptDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem("restart_dosha_prompt_dismissed") === "1"; }
    catch { return false; }
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("test-mode-status");
        setTestMode(!!(data as any)?.enabled);
      } catch { setTestMode(false); }
    })();
  }, []);

  const handleResetApp = async () => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    try { await signOut(); } catch {}
    nav("/", { replace: true });
  };

  const handleTestNewUser = async () => {
    try {
      if (user) {
        // Wipe user-generated rows
        await Promise.all([
          supabase.from("check_ins").delete().eq("user_id", user.id),
          supabase.from("plans").delete().eq("user_id", user.id),
          supabase.from("practice_history").delete().eq("user_id", user.id),
          supabase.from("user_journey_progress").delete().eq("user_id", user.id),
          supabase.from("restart_feedback").delete().eq("user_id", user.id),
        ]);
        // Reset profile to brand-new state
        await supabase.from("profiles").update({
          name: null,
          path: null,
          chronotype: null,
          chronotype_headline: null,
          chronotype_description: null,
          onboarding_answers: {},
          completed_practices: 0,
          streak_days: 0,
          onboarding_completed: false,
          current_day: 1,
          journey_started_at: null,
          whatsapp_phone: null,
          age: null,
          goal: null,
          consent_given_at: null,
          consent_signature: null,
          didi_xp: 0,
          dosha: null,
        } as any).eq("id", user.id);
      }
    } catch {}
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    try { await signOut(); } catch {}
    nav("/", { replace: true });
  };

  const handleStartInvestorDemo = async () => {
    if (!user || demoBusy) return;
    if (!window.confirm("Start investor demo? Your current profile + history will be backed up and restored on exit.")) return;
    setDemoBusy(true);
    try {
      await startInvestorDemo(user.id);
      toast.success("Demo started — going through onboarding");
      window.location.replace("/");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start demo");
      setDemoBusy(false);
    }
  };

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
  const hasDosha = !!(profile as any)?.dosha;
  const showDoshaPrompt = !hasDosha && !doshaPromptDismissed;
  const dismissDoshaPrompt = () => {
    try { localStorage.setItem("restart_dosha_prompt_dismissed", "1"); } catch {}
    setDoshaPromptDismissed(true);
  };

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
        {/* Greeting */}
        <h1 className="text-[24px] font-bold text-white">{greetingFor(profile?.name)}</h1>
        <p className="text-[14px] text-rs-muted mt-1">{getDayPhrase(day)}</p>

        {/* Streak */}
        <div className="flex items-center gap-3 mt-3">
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
        </div>

        {showDoshaPrompt && (
          <div className="mb-4 rounded-2xl p-4 bg-rs-cream/15 border border-rs-cream/40">
            <p className="text-white text-[14px] font-semibold">Personalise your Ayurvedic practices</p>
            <p className="text-rs-muted text-[12px] mt-1">
              Take the 5-question dosha quiz so we can tailor your daily ritual.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => nav("/dosha-quiz")}
                className="px-4 py-2 btn-cream text-[13px] font-semibold inline-flex items-center gap-1.5">
                Take the quiz <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={dismissDoshaPrompt}
                className="text-rs-muted text-[12px]">
                Later
              </button>
            </div>
          </div>
        )}

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
                    <p className="text-white text-[15px] text-rs-navy">You've checked in today.</p>
                 </div>
                 {detectedState && (
                   <div className="mt-3">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-rs-muted text-rs-navy">State detected</p>
                      <span className="inline-block mt-1 px-3 py-1 rounded-full bg-rs-cream/20 text-white text-[12px] capitalize text-rs-navy border-rs-cream">{detectedState}</span>
                   </div>
                 )}
                  <button onClick={() => nav("/practices")}
                    className="w-full mt-4 py-3 btn-outline-white flex items-center justify-center gap-2 text-rs-navy bg-rs-cream">
                    See today's practices <ArrowRight className="w-4 h-4" />
                  </button>
                 <button onClick={() => nav("/journey")}
                   className="w-full mt-2 py-3 text-rs-cream text-[13px] font-medium underline-offset-4 hover:underline">
                   3-day plan ready →
                 </button>
                  <p className="text-rs-muted text-[12px] italic mt-4 text-center text-rs-cream">Tomorrow: a deeper ritual to ground your evening.</p>
               </>
             )}
           </div>

        {testMode && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={handleResetApp}
              className="text-[11px] text-white/50 hover:text-white/80 hover:underline"
            >
              Reset App
            </button>
            <button
              onClick={handleTestNewUser}
              className="text-[11px] text-white/50 hover:text-white/80 hover:underline"
            >
              Test new user flow
            </button>
          </div>
        )}
        {isAdmin && !demoActive && (
          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={handleStartInvestorDemo}
              disabled={demoBusy}
              className="text-[10px] text-white/30 hover:text-white/70 hover:underline tracking-wider"
            >
              {demoBusy ? "starting…" : "· demo mode ·"}
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
};
export default HomeScreen;
