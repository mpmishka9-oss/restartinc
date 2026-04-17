import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import OnboardingFlow, { type OnboardingData } from "@/components/OnboardingFlow";
import ReflectiveQuestions, { type ReflectiveData } from "@/components/ReflectiveQuestions";
import ChronotypeResult from "@/components/ChronotypeResult";
import { assignChronotype, type Chronotype } from "@/lib/chronotype";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "onboarding" | "reflective" | "result">("welcome");
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [chronotype, setChronotype] = useState<Chronotype | null>(null);

  const handleReflectiveComplete = async (reflective: ReflectiveData) => {
    if (!userData) return;

    const { chronotype: assigned, scores } = assignChronotype(userData, reflective);
    setChronotype(assigned);
    setScreen("result");

    // Persist silently in background
    const PRODUCTIVITY = "I'm highly ambitious and want to boost my productivity to achieve more";
    const path = reflective.condition === PRODUCTIVITY ? "ambitious" : "stressed";

    const { error } = await supabase
      .from("user_responses")
      .upsert(
        {
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
          reflective_answers: reflective as unknown as Record<string, unknown>,
          chronotype: assigned,
          chronotype_scores: scores,
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Failed to save responses:", error);
      toast.error("We couldn't save your responses, but your result is ready.");
    }
  };

  if (screen === "welcome") {
    return <WelcomeScreen onNext={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return (
      <OnboardingFlow
        onComplete={(data) => {
          setUserData(data);
          setScreen("reflective");
        }}
      />
    );
  }

  if (screen === "reflective") {
    return <ReflectiveQuestions onComplete={handleReflectiveComplete} />;
  }

  if (screen === "result" && chronotype) {
    return <ChronotypeResult chronotype={chronotype} name={userData?.name} />;
  }

  return null;
};

export default Index;
