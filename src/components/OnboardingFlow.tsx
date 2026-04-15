import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  role: string;
  age: string;
  email: string;
  name: string;
  goal: string;
}

const roles = [
  "Student",
  "Working Professional",
  "Freelancer / Self-employed",
  "Between jobs / Taking a break",
  "Homemaker / Caregiver",
];

const ages = ["Under 18", "18 - 24", "25 - 35", "36 - 45", "45+"];

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    age: "",
    email: "",
    name: "",
    goal: "",
  });

  const totalSteps = 5;

  const canProceed = () => {
    switch (step) {
      case 0: return data.role !== "";
      case 1: return data.age !== "";
      case 2: return data.email !== "";
      case 3: return data.name !== "";
      case 4: return data.goal !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const SelectOption = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium ${
        selected
          ? "bg-primary/40 border-primary text-foreground shadow-sm"
          : "bg-card/50 border-border/50 text-foreground hover:bg-card/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {selected && <Check className="w-4 h-4 text-foreground" />}
      </div>
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What describes you best right now?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {roles.map((r) => (
              <SelectOption key={r} label={r} selected={data.role === r} onClick={() => setData({ ...data, role: r })} />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What's your age group?</h2>
            <p className="text-muted-foreground text-xs mb-4">This helps us tailor your experience</p>
            {ages.map((a) => (
              <SelectOption key={a} label={a} selected={data.age === a} onClick={() => setData({ ...data, age: a })} />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-1">What's your email?</h2>
            <p className="text-muted-foreground text-xs mb-4">We'll use this to save your progress</p>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-5 py-4 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-1">What do you want to name yourself?</h2>
            <p className="text-muted-foreground text-xs mb-4">Pick a name you'd like us to call you</p>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Your name or nickname"
              className="w-full px-5 py-4 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-1">Your 7-day goal ✨</h2>
            <p className="text-muted-foreground text-xs mb-4">Write down one goal you want to achieve in the next 7 days</p>
            <textarea
              value={data.goal}
              onChange={(e) => setData({ ...data, goal: e.target.value })}
              placeholder="e.g., Complete my portfolio website..."
              rows={4}
              className="w-full px-5 py-4 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-8 px-6"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {step > 0 && (
          <button onClick={handleBack} className="p-2 rounded-full bg-card/50 text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                i <= step ? "bg-primary" : "bg-card/50"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-medium">{step + 1}/{totalSteps}</span>
      </div>

      {/* Content */}
      <div className="flex-1">{renderStep()}</div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!canProceed()}
        className={`w-full py-4 rounded-2xl font-semibold text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
          canProceed()
            ? "bg-primary text-primary-foreground hover:brightness-105 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {step === totalSteps - 1 ? "Finish" : "Continue"}
        {step < totalSteps - 1 && canProceed() && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default OnboardingFlow;
