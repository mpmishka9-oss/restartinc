import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  role: string;
  age: string;
  email: string;
  gender: string;
  name: string;
  sleepGeneral: string;
  personType: string;
  regularPractice: string;
  wellnessAttitude: string;
}

const roles = [
  "Student",
  "Working Professional",
  "Freelancer / Self-employed",
  "Between jobs / Taking a break",
  "Homemaker / Caregiver",
];

const ages = ["Under 18", "18 - 24", "25 - 35", "36 - 45", "45+"];

const sleepGeneralOptions = [
  "I sleep well most nights — 7–8 hrs",
  "It varies a lot — some nights good, some bad",
  "I consistently sleep less than I should",
  "I struggle to fall/stay asleep regularly",
  "I crash hard but never feel rested",
];

const personTypeOptions = [
  "A morning person",
  "A night owl",
  "Somewhere in between",
];

const regularPracticeOptions = [
  "Exercise / movement",
  "Meditation or breathwork",
  "A consistent morning or evening routine",
  "None of these yet",
];

const wellnessAttitudeOptions = [
  "Open to trying anything",
  "Prefer science-backed approaches",
  "Drawn to holistic / ancient wisdom",
  "Sceptical but curious",
];

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    age: "",
    email: "",
    gender: "",
    name: "",
    sleepGeneral: "",
    personType: "",
    regularPractice: "",
    wellnessAttitude: "",
  });

  const totalSteps = 9;

  const canProceed = () => {
    switch (step) {
      case 0: return data.role !== "";
      case 1: return data.age !== "";
      case 2: return data.email !== "";
      case 3: return data.gender !== "";
      case 4: return data.name !== "";
      case 5: return data.sleepGeneral !== "";
      case 6: return data.personType !== "";
      case 7: return data.regularPractice !== "";
      case 8: return data.wellnessAttitude !== "";
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

  const advance = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(data);
  };

  const selectAndAdvance = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData({ ...data, [key]: value });
    setTimeout(() => {
      setStep((s) => (s < totalSteps - 1 ? s + 1 : s));
    }, 150);
    if (step === totalSteps - 1) {
      setTimeout(() => onComplete({ ...data, [key]: value }), 150);
    }
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
        <span className="text-primary-foreground font-semibold rounded-none shadow-sm">{label}</span>
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
              <SelectOption key={r} label={r} selected={data.role === r} onClick={() => selectAndAdvance("role", r)} />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What's your age group?</h2>
            <p className="text-muted-foreground text-xs mb-4">This helps us tailor your experience</p>
            {ages.map((a) => (
              <SelectOption key={a} label={a} selected={data.age === a} onClick={() => selectAndAdvance("age", a)} />
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
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What's your gender?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {["Male", "Female", "Other"].map((g) => (
              <SelectOption key={g} label={g} selected={data.gender === g} onClick={() => selectAndAdvance("gender", g)} />
            ))}
          </div>
        );
      case 4:
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
      case 5:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">How would you describe your sleep in general?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {sleepGeneralOptions.map((o) => (
              <SelectOption key={o} label={o} selected={data.sleepGeneral === o} onClick={() => selectAndAdvance("sleepGeneral", o)} />
            ))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What type of person are you?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {personTypeOptions.map((o) => (
              <SelectOption key={o} label={o} selected={data.personType === o} onClick={() => selectAndAdvance("personType", o)} />
            ))}
          </div>
        );
      case 7:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">Which of these is currently a regular part of your life?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {regularPracticeOptions.map((o) => (
              <SelectOption key={o} label={o} selected={data.regularPractice === o} onClick={() => selectAndAdvance("regularPractice", o)} />
            ))}
          </div>
        );
      case 8:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">How do you feel about wellness practices like breath-work, cold exposure, journaling or herbal routines?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {wellnessAttitudeOptions.map((o) => (
              <SelectOption key={o} label={o} selected={data.wellnessAttitude === o} onClick={() => selectAndAdvance("wellnessAttitude", o)} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-8 px-6"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="p-2 rounded-full bg-card/50 text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
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
            ? "text-primary-foreground hover:brightness-105 active:scale-[0.98] bg-foreground"
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
