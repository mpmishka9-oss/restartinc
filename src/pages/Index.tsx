import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import OnboardingFlow, { type OnboardingData } from "@/components/OnboardingFlow";
import logo from "@/assets/logo.png";

const Index = () => {
  const [screen, setScreen] = useState<"welcome" | "onboarding" | "done">("welcome");
  const [userData, setUserData] = useState<OnboardingData | null>(null);

  if (screen === "welcome") {
    return <WelcomeScreen onNext={() => setScreen("onboarding")} />;
  }

  if (screen === "onboarding") {
    return (
      <OnboardingFlow
        onComplete={(data) => {
          setUserData(data);
          setScreen("done");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}
    >
      <img src={logo} alt="reStart" className="w-24 h-24 object-contain rounded-xl mb-6" />
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Welcome, {userData?.name}! 🎉
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-6">
        You're all set. Your 7-day journey starts now.
      </p>
      <div className="w-full max-w-sm bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Your goal for the next 7 days:</p>
        <p className="text-foreground font-medium text-sm">{userData?.goal}</p>
      </div>
    </div>
  );
};

export default Index;
