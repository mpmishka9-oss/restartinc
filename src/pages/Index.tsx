import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import OnboardingFlow, { type OnboardingData } from "@/components/OnboardingFlow";
import ReflectiveQuestions, { type ReflectiveData } from "@/components/ReflectiveQuestions";
import ChronotypeReveal from "@/components/ChronotypeReveal";
import CheckInScreen from "@/components/CheckInScreen";
import ThreeDayPlan from "@/components/ThreeDayPlan";
import PracticesTab from "@/components/PracticesTab";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import { assignChronotype, type Chronotype } from "@/lib/chronotype";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "onboarding" | "reflective" | "reveal" | "app">("welcome");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [tab, setTab] = useState<AppTab>("checkin");
  const [latestState, setLatestState] = useState<string | null>(null);
  const [latestLevel, setLatestLevel] = useState<1 | 2 | 3>(1);
  const [hasPlan, setHasPlan] = useState(false);

  const handleReflectiveComplete = async (reflective: ReflectiveData) => {
    if (!userData) return;

    const { chronotype: localAssigned, scores } = assignChronotype(userData, reflective);
    const PRODUCTIVITY = "I'm highly ambitious and want to boost my productivity to achieve more";
    const path = reflective.condition === PRODUCTIVITY ? "ambitious" : "stressed";

    let assigned: Chronotype = localAssigned;
    let aiHeadline = "";
    let aiDescription = "";
    try {
      const { data, error } = await supabase.functions.invoke("assign-chronotype", {
        body: { onboarding_answers: { ...userData, ...reflective } },
      });
      if (!error && data?.chronotype) {
        assigned = data.chronotype as Chronotype;
        aiHeadline = data.headline ?? "";
        aiDescription = data.description ?? "";
      }
    } catch (e) {
      console.error("chronotype AI failed, using local", e);
    }

    setChronotype(assigned);
    setHeadline(aiHeadline);
    setDescription(aiDescription);
    setScreen("reveal");

    const { data: upserted, error } = await supabase
      .from("user_responses")
      .upsert(
        [{
          email: userData.email,
          name: userData.name,
          role: userData.role,
          age: userData.age,
          gender: userData.gender,
          sleep_general: userData.sleepGeneral,
          person_type: userData.personType,
          regular_practice: userData.regularPractice,
          wellness_attitude: userData.wellnessAttitude,
          path,
          reflective_answers: reflective as never,
          chronotype: assigned,
          chronotype_scores: scores,
          chronotype_headline: aiHeadline,
          chronotype_description: aiDescription,
        }],
        { onConflict: "email" }
      )
      .select("id, created_at, streak_days")
      .single();

    if (error) {
      console.error("Failed to save responses:", error);
      toast.error("We couldn't save your responses, but your result is ready.");
    } else if (upserted) {
      setUserId(upserted.id);
      setCreatedAt(upserted.created_at);
      setStreakDays(upserted.streak_days ?? 0);
    }
  };

  if (screen === "welcome") return <WelcomeScreen onNext={() => setScreen("onboarding")} />;

  if (screen === "onboarding") {
    return <OnboardingFlow onComplete={(data) => { setUserData(data); setScreen("reflective"); }} />;
  }

  if (screen === "reflective") {
    return <ReflectiveQuestions onComplete={handleReflectiveComplete} />;
  }

  if (screen === "reveal" && chronotype) {
    return (
      <ChronotypeReveal
        chronotype={chronotype}
        headline={headline}
        description={description}
        onContinue={() => setScreen("app")}
      />
    );
  }

  if (screen === "app" && chronotype) {
    const daysSinceSignup = createdAt
      ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000))
      : 0;
    return (
      <div className="relative">
        {tab === "checkin" && userId && (
          <CheckInScreen
            userId={userId}
            daysSinceSignup={daysSinceSignup}
            streakDays={streakDays}
            onComplete={({ detected_state, assigned_level }) => {
              setLatestState(detected_state);
              setLatestLevel(Math.min(3, Math.max(1, assigned_level)) as 1 | 2 | 3);
              setHasPlan(true);
              setTab("plan");
            }}
          />
        )}
        {tab === "checkin" && !userId && (
          <div className="min-h-screen flex items-center justify-center px-6 pb-28"
            style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
            <p className="text-sm text-foreground text-center">Saving your profile...</p>
          </div>
        )}
        {tab === "plan" && (
          hasPlan && latestState ? (
            <ThreeDayPlan
              chronotype={chronotype}
              detectedState={latestState}
              onSave={() => { toast.success("Plan saved"); setTab("practices"); }}
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center px-6 pb-28"
              style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
              <p className="text-sm text-foreground text-center">Do a check-in first to generate your 3-day plan.</p>
            </div>
          )
        )}
        {tab === "practices" && (
          <PracticesTab detectedState={latestState} assignedLevel={latestLevel} />
        )}
        <BottomNav active={tab} onChange={setTab} />
      </div>
    );
  }

  return null;
};

export default Index;