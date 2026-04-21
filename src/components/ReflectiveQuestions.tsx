import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface ReflectiveData {
  condition: string;
  // Productivity branch
  goalsFeeling: string[];
  energyToday: string;
  slowingDown: string[];
  clarityToday: string;
  workload: string;
  workingMode: string;
  successLook: string;
  focusTime: string;
  productivitySupport: string;
  // Wellbeing branch
  emotionalState: string[];
  feelFrequency: string;
  bodyLocation: string;
  feelingStart: string;
  rootCause: string;
  affect: string;
  feltBefore: string;
  triedAlready: string[];
  supportType: string;
}

interface ReflectiveQuestionsProps {
  onComplete: (data: ReflectiveData) => void;
}

const PRODUCTIVITY = "I'm highly ambitious and want to boost my productivity to achieve more";
const WELLBEING = "Life's a bit too much right now (like stress, overwhelmed, anxiety & burnout)";

const ReflectiveQuestions = ({ onComplete }: ReflectiveQuestionsProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ReflectiveData>({
    condition: "",
    goalsFeeling: [],
    energyToday: "",
    slowingDown: [],
    clarityToday: "",
    workload: "",
    workingMode: "",
    successLook: "",
    focusTime: "",
    productivitySupport: "",
    emotionalState: [],
    feelFrequency: "",
    bodyLocation: "",
    feelingStart: "",
    rootCause: "",
    affect: "",
    feltBefore: "",
    triedAlready: [],
    supportType: "",
  });

  // Total steps = 1 (condition) + 10 (branch). Both branches have 10 questions.
  const totalSteps = 11;

  const isProductivity = data.condition === PRODUCTIVITY;
  const isWellbeing = data.condition === WELLBEING;

  const canProceed = () => {
    if (step === 0) return data.condition !== "";

    if (isProductivity) {
      switch (step) {
        case 1: return data.goalsFeeling.length > 0;
        case 2: return data.energyToday !== "";
        case 3: return data.slowingDown.length > 0;
        case 4: return data.clarityToday !== "";
        case 5: return data.workload !== "";
        case 6: return data.workingMode !== "";
        case 7: return data.successLook !== "";
        case 8: return data.focusTime !== "";
        case 9: return data.productivitySupport !== "";
        case 10: return true;
        default: return false;
      }
    }

    if (isWellbeing) {
      switch (step) {
        case 1: return data.emotionalState.length > 0;
        case 2: return data.feelFrequency !== "";
        case 3: return data.bodyLocation !== "";
        case 4: return data.feelingStart !== "";
        case 5: return data.rootCause !== "";
        case 6: return data.affect !== "";
        case 7: return data.feltBefore !== "";
        case 8: return data.triedAlready.length > 0;
        case 9: return data.supportType !== "";
        case 10: return true;
        default: return false;
      }
    }
    return false;
  };

  // Effective last meaningful step is 9 (10 questions: index 0..9)
  const lastStep = 9;

  const handleNext = () => {
    if (step < lastStep) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const advanceSoon = () => {
    setTimeout(() => {
      setStep((s) => (s < lastStep ? s + 1 : s));
    }, 150);
  };

  const setSingle = <K extends keyof ReflectiveData>(key: K, value: ReflectiveData[K]) => {
    setData({ ...data, [key]: value });
    advanceSoon();
  };

  const SelectOption = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium ${
        selected
          ? "bg-muted border-primary text-foreground shadow-sm"
          : "bg-card/50 border-border/50 text-foreground hover:bg-card/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-primary-foreground shadow-sm">{label}</span>
        {selected && <Check className="w-4 h-4 text-foreground" />}
      </div>
    </button>
  );

  const MultiSelectOption = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium ${
        selected
          ? "bg-primary/40 border-primary text-foreground shadow-sm"
          : "bg-card/50 border-border/50 text-foreground hover:bg-card/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-primary-foreground font-medium">{label}</span>
        {selected && <Check className="w-4 h-4 text-foreground" />}
      </div>
    </button>
  );

  const toggleMulti = (key: "goalsFeeling" | "slowingDown" | "emotionalState" | "triedAlready", option: string) => {
    const arr = data[key];
    if (arr.includes(option)) {
      setData({ ...data, [key]: arr.filter((t) => t !== option) });
    } else {
      setData({ ...data, [key]: [...arr, option] });
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground mb-1">Be honest - what's going on?</h2>
          <p className="text-muted-foreground text-xs mb-4">Select what resonates with you</p>
          {[PRODUCTIVITY, WELLBEING].map((o) => (
            <SelectOption
              key={o}
              label={o}
              selected={data.condition === o}
              onClick={() => setData({ ...data, condition: o })}
            />
          ))}
        </div>
      );
    }

    if (isProductivity) {
      switch (step) {
        case 1:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How do you feel about your goals/work right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">Select all that apply</p>
              {["Driven", "Pressured", "Stuck", "Overwhelmed / stressed", "Unfocused", "Indifferent", "Unsure"].map((o) => (
                <MultiSelectOption key={o} label={o} selected={data.goalsFeeling.includes(o)} onClick={() => toggleMulti("goalsFeeling", o)} />
              ))}
            </div>
          );
        case 2:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How has your energy been today?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["High - ready to go", "Decent - can work, but not at my peak", "Low - struggling to get started", "Drained - no motivation"].map((o) => (
                <SelectOption key={o} label={o} selected={data.energyToday === o} onClick={() => setData({ ...data, energyToday: o })} />
              ))}
            </div>
          );
        case 3:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What's slowing you down the most right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">Select all that apply</p>
              {["Distractions (Phone, people, environment)", "Overthinking / perfectionism", "Low energy / fatigue", "Too many things at once", "Lack of direction", "Procrastination"].map((o) => (
                <MultiSelectOption key={o} label={o} selected={data.slowingDown.includes(o)} onClick={() => toggleMulti("slowingDown", o)} />
              ))}
            </div>
          );
        case 4:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How clear are you on what you need to do today?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Very clear - I know exactly what to do", "Somewhat clear - but not fully structured", "Vague - I have ideas but no clear plan", "No clarity - I feel lost"].map((o) => (
                <SelectOption key={o} label={o} selected={data.clarityToday === o} onClick={() => setData({ ...data, clarityToday: o })} />
              ))}
            </div>
          );
        case 5:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What does your workload feel like right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Under control", "Slightly heavy but manageable", "Overloaded", "Chaotic - I don't know where to start"].map((o) => (
                <SelectOption key={o} label={o} selected={data.workload === o} onClick={() => setData({ ...data, workload: o })} />
              ))}
            </div>
          );
        case 6:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How are you currently working?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Deep focus - locked in", "Starting and stopping frequently", "Avoiding / delaying tasks", "Busy, but not making real progress"].map((o) => (
                <SelectOption key={o} label={o} selected={data.workingMode === o} onClick={() => setData({ ...data, workingMode: o })} />
              ))}
            </div>
          );
        case 7:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What does a successful session look like for you today?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Crushing a key deliverable", "Making meaningful progress on a big goal", "Clearing the noise so I can focus", "Honestly, just getting unstuck"].map((o) => (
                <SelectOption key={o} label={o} selected={data.successLook === o} onClick={() => setData({ ...data, successLook: o })} />
              ))}
            </div>
          );
        case 8:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How much time can you realistically focus right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["60+ minutes", "30–60 minutes", "10–30 minutes", "Less than 10 minutes"].map((o) => (
                <SelectOption key={o} label={o} selected={data.focusTime === o} onClick={() => setData({ ...data, focusTime: o })} />
              ))}
            </div>
          );
        case 9:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What kind of support do you need right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Help getting started", "Focus support (stay on track)", "Energy boost / reset", "Quick win - something fast"].map((o) => (
                <SelectOption key={o} label={o} selected={data.productivitySupport === o} onClick={() => setData({ ...data, productivitySupport: o })} />
              ))}
            </div>
          );
      }
    }

    if (isWellbeing) {
      switch (step) {
        case 1:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">Which of these best describes your emotional state lately?</h2>
              <p className="text-muted-foreground text-xs mb-4">Select all that apply</p>
              {["Anxious / worried", "Angry / Frustrated", "Sad / Low", "Overwhelmed / scattered", "Numb / empty", "Stressed / pressure", "Lost / confused", "I don't know"].map((o) => (
                <MultiSelectOption key={o} label={o} selected={data.emotionalState.includes(o)} onClick={() => toggleMulti("emotionalState", o)} />
              ))}
            </div>
          );
        case 2:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How often do you feel this way?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["Almost everyday", "A few times a week", "Occasionally", "This is a recent shift - it's new"].map((o) => (
                <SelectOption key={o} label={o} selected={data.feelFrequency === o} onClick={() => setData({ ...data, feelFrequency: o })} />
              ))}
            </div>
          );
        case 3:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">Where in your body do you feel it the most?</h2>
              <p className="text-muted-foreground text-xs mb-4">Tune into your body</p>
              {["Stomach / gut", "Head / temples", "Throat / neck", "Whole body", "I don't feel it physically"].map((o) => (
                <SelectOption key={o} label={o} selected={data.bodyLocation === o} onClick={() => setData({ ...data, bodyLocation: o })} />
              ))}
            </div>
          );
        case 4:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">When did this feeling start?</h2>
              <p className="text-muted-foreground text-xs mb-4">Try to recall</p>
              {["Just now - something specific triggered it", "A few hours ago", "Since I woke up", "Been there for a few days", "I genuinely don't know"].map((o) => (
                <SelectOption key={o} label={o} selected={data.feelingStart === o} onClick={() => setData({ ...data, feelingStart: o })} />
              ))}
            </div>
          );
        case 5:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">Do you have a sense of what's been at the root of this for you?</h2>
              <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
              {["A specific life event or situation", "A slow build-up over time", "It comes in cycles - I don't always know why", "I genuinely have no idea"].map((o) => (
                <SelectOption key={o} label={o} selected={data.rootCause === o} onClick={() => setData({ ...data, rootCause: o })} />
              ))}
            </div>
          );
        case 6:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">How is this feeling affecting you right now?</h2>
              <p className="text-muted-foreground text-xs mb-4">What resonates the most?</p>
              {["Can't focus / concentrate", "Feels like withdrawing / isolating", "I'm going through motions but not present", "I physically feel unwell (headache, stress, fatigue)", "Spiralling in my thoughts"].map((o) => (
                <SelectOption key={o} label={o} selected={data.affect === o} onClick={() => setData({ ...data, affect: o })} />
              ))}
            </div>
          );
        case 7:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">Have you felt this way before?</h2>
              <p className="text-muted-foreground text-xs mb-4">Think back</p>
              {["Yes, this is very familiar - it comes back often", "Yes, but usually milder than this", "Rarely - this feels unusual for me", "No, this is new for me"].map((o) => (
                <SelectOption key={o} label={o} selected={data.feltBefore === o} onClick={() => setData({ ...data, feltBefore: o })} />
              ))}
            </div>
          );
        case 8:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What have you already tried?</h2>
              <p className="text-muted-foreground text-xs mb-4">Select all that apply</p>
              {["Nothing yet", "Distraction (scrolling, music, TV)", "Talking to someone about it", "Exercise / movement", "Food / drink", "Breathing / meditation / sleeping"].map((o) => (
                <MultiSelectOption key={o} label={o} selected={data.triedAlready.includes(o)} onClick={() => toggleMulti("triedAlready", o)} />
              ))}
            </div>
          );
        case 9:
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground mb-1">What kind of support feels right to you?</h2>
              <p className="text-muted-foreground text-xs mb-4">We'll tailor your experience</p>
              {[
                "Something physical that I can do with my body",
                "Something I can think through mentally",
                "A calming practice / ritual",
                "Something quick - under 5 minutes",
                "Something I can do tonight before sleeping",
              ].map((o) => (
                <SelectOption key={o} label={o} selected={data.supportType === o} onClick={() => setData({ ...data, supportType: o })} />
              ))}
            </div>
          );
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col py-8 px-6"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}
    >
      {/* Intro text on first step */}
      {step === 0 && (
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-border/50">
          <p className="text-sm font-medium leading-relaxed text-primary-foreground">
            Before continuing, here are a few questions to understand you better and give you a more personalised solution to help you reach your goal.
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={handleBack} className="p-2 rounded-full bg-card/50 text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex gap-1">
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
      <div className="flex-1 overflow-y-auto">{renderStep()}</div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!canProceed()}
        className={`w-full py-4 rounded-2xl font-semibold text-base shadow-lg flex items-center justify-center gap-2 transition-all mt-6 ${
          canProceed()
            ? "bg-foreground text-primary-foreground hover:brightness-105 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {step === lastStep ? "Finish" : "Continue"}
        {step < lastStep && canProceed() && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ReflectiveQuestions;
