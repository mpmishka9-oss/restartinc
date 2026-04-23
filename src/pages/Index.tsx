import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import SplashScreen from "@/components/SplashScreen";
import AuthScreen from "@/components/AuthScreen";
import PathSelection from "@/components/PathSelection";
import Onboarding from "@/components/Onboarding";
import AssigningChronotype from "@/components/AssigningChronotype";
import ChronotypeReveal from "@/components/ChronotypeReveal";
import HomeScreen from "@/components/HomeScreen";
import CheckInScreen from "@/components/CheckInScreen";
import ThreeDayPlan from "@/components/ThreeDayPlan";
import PracticesLibrary from "@/components/PracticesLibrary";
import ProfileScreen from "@/components/ProfileScreen";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import type { Path, Chronotype } from "@/lib/restartData";
import { toast } from "sonner";

type Stage = "splash" | "path" | "onboarding" | "assigning" | "reveal" | "app" | "checkin";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refresh } = useProfile();
  const [stage, setStage] = useState<Stage>("splash");
  const [splashShown, setSplashShown] = useState(false);
  const [tab, setTab] = useState<AppTab>("home");
  const [revealData, setRevealData] = useState<{ chronotype: Chronotype; headline: string; description: string } | null>(null);

  // Decide stage when auth/profile resolves
  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) return; // AuthScreen renders below
    // Returning users skip splash
    if (profile?.onboarding_completed) {
      setStage("app");
      return;
    }
    // New user — show splash once, then onboarding
    if (!splashShown) {
      setStage("splash");
    } else if (!profile?.path) {
      setStage("path");
    } else if (!profile?.chronotype) {
      setStage("onboarding");
    } else {
      setStage("app");
    }
  }, [authLoading, profileLoading, user, profile, splashShown]);

  if (authLoading) return <div className="min-h-screen bg-app flex items-center justify-center"><div className="dot-loader"><span/><span/><span/></div></div>;
  if (!user) return <AuthScreen />;
  if (profileLoading) return <div className="min-h-screen bg-app flex items-center justify-center"><div className="dot-loader"><span/><span/><span/></div></div>;

  if (stage === "splash") {
    return <SplashScreen onDone={() => { setSplashShown(true); setStage(profile?.path ? (profile?.chronotype ? "app" : "onboarding") : "path"); }} />;
  }

  if (stage === "path") {
    return <PathSelection onSelect={async (p: Path) => {
      await supabase.from("profiles").update({ path: p }).eq("id", user.id);
      await refresh();
      setStage("onboarding");
    }} />;
  }

  if (stage === "onboarding") {
    return <Onboarding path={(profile?.path as Path) ?? "emotional"} onComplete={async (answers, name, email) => {
      await supabase.from("profiles").update({
        onboarding_answers: answers,
        name: name || null,
        email: email || profile?.email || null,
      }).eq("id", user.id);
      setStage("assigning");
      try {
        const { data, error } = await supabase.functions.invoke("assign-chronotype", {
          body: { onboarding_answers: answers, path: profile?.path },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        await supabase.from("profiles").update({
          chronotype: data.chronotype,
          chronotype_headline: data.headline,
          chronotype_description: data.description,
          onboarding_completed: true,
        }).eq("id", user.id);
        await refresh();
        setRevealData({ chronotype: data.chronotype, headline: data.headline, description: data.description });
        setStage("reveal");
      } catch (e: any) {
        toast.error(e.message ?? "Couldn't read your rhythm — try again?");
        setStage("onboarding");
      }
    }} />;
  }

  if (stage === "assigning") return <AssigningChronotype />;

  if (stage === "reveal" && revealData) {
    return <ChronotypeReveal {...revealData} onContinue={() => setStage("app")} />;
  }

  if (stage === "checkin") {
    return <CheckInScreen onDone={() => setStage("app")} onSeePractices={() => { setStage("app"); setTab("plan"); }} />;
  }

  // App with bottom nav
  return (
    <>
      {tab === "home" && <HomeScreen onOpenCheckIn={() => setStage("checkin")} onSeePlan={() => setTab("plan")} />}
      {tab === "practices" && <PracticesLibrary />}
      {tab === "plan" && <ThreeDayPlan />}
      {tab === "profile" && <ProfileScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
};

export default Index;
