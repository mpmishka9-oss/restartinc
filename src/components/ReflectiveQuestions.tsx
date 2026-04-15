import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface ReflectiveData {
  condition: string;
  sleep: string;
  feeling: string;
  intensity: number;
  bodyLocation: string;
  feelingStart: string;
  driver: string[];
  driverOther: string;
  affect: string;
  feltBefore: string;
  triedAlready: string[];
  supportType: string;
}

interface ReflectiveQuestionsProps {
  onComplete: (data: ReflectiveData) => void;
}

const totalSteps = 11;

const ReflectiveQuestions = ({ onComplete }: ReflectiveQuestionsProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ReflectiveData>({
    condition: "",
    sleep: "",
    feeling: "",
    intensity: 5,
    bodyLocation: "",
    feelingStart: "",
    driver: [],
    driverOther: "",
    affect: "",
    feltBefore: "",
    triedAlready: [],
    supportType: "",
  });

  const canProceed = () => {
    switch (step) {
      case 0: return data.condition !== "";
      case 1: return data.sleep !== "";
      case 2: return data.feeling !== "";
      case 3: return true; // intensity always has a value
      case 4: return data.bodyLocation !== "";
      case 5: return data.feelingStart !== "";
      case 6: return data.driver.length > 0;
      case 7: return data.affect !== "";
      case 8: return data.feltBefore !== "";
      case 9: return data.triedAlready.length > 0;
      case 10: return data.supportType !== "";
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
        <span>{label}</span>
        {selected && <Check className="w-4 h-4 text-foreground" />}
      </div>
    </button>
  );

  const toggleDriverOption = (option: string) => {
    if (option === "Multiple things at once") {
      if (data.driver.includes(option)) {
        setData({ ...data, driver: [], driverOther: "" });
      } else {
        setData({ ...data, driver: [option] });
      }
      return;
    }
    // If "Multiple things at once" is selected, allow adding sub-options
    if (data.driver.includes("Multiple things at once")) {
      const subOptions = data.driver.filter(d => d !== "Multiple things at once");
      if (subOptions.includes(option)) {
        setData({ ...data, driver: ["Multiple things at once", ...subOptions.filter(d => d !== option)] });
      } else {
        setData({ ...data, driver: ["Multiple things at once", ...subOptions, option] });
      }
      return;
    }
    setData({ ...data, driver: [option] });
  };

  const toggleTriedOption = (option: string) => {
    if (data.triedAlready.includes(option)) {
      setData({ ...data, triedAlready: data.triedAlready.filter(t => t !== option) });
    } else {
      setData({ ...data, triedAlready: [...data.triedAlready, option] });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">Do any of these apply to you?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select one that fits</p>
            {["I have ADHD / neurodivergent", "I work night shifts / irregular hours", "None of the above", "Prefer not to say"].map((o) => (
              <SelectOption key={o} label={o} selected={data.condition === o} onClick={() => setData({ ...data, condition: o })} />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">How was your sleep last night?</h2>
            <p className="text-muted-foreground text-xs mb-4">Be honest — no judgement here</p>
            {["Slept well, fully rested", "Slept okay, a bit tired", "Slept poorly, quite tired", "Did not sleep / pulled an all-nighter"].map((o) => (
              <SelectOption key={o} label={o} selected={data.sleep === o} onClick={() => setData({ ...data, sleep: o })} />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">In one word, how are you feeling right now?</h2>
            <p className="text-muted-foreground text-xs mb-4">Pick the closest match</p>
            {["Anxious / worried", "Angry / frustrated", "Sad / low", "Overwhelmed / scattered", "Numb / empty", "Stressed / pressure", "Lost / confused", "I don't know"].map((o) => (
              <SelectOption key={o} label={o} selected={data.feeling === o} onClick={() => setData({ ...data, feeling: o })} />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground mb-1">How intense is this feeling?</h2>
            <p className="text-muted-foreground text-xs mb-6">Tap a number to select</p>
            <div className="flex justify-between gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setData({ ...data, intensity: n })}
                  className={`w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center ${
                    data.intensity === n
                      ? "bg-primary text-primary-foreground shadow-md scale-110"
                      : "bg-card/50 border border-border/50 text-foreground hover:bg-card/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
              <span>Barely noticeable</span>
              <span>Overwhelming</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">Where in your body do you feel it the most?</h2>
            <p className="text-muted-foreground text-xs mb-4">Tune into your body</p>
            {["Stomach / gut", "Head / temples", "Throat / neck", "Whole body", "I don't feel it physically"].map((o) => (
              <SelectOption key={o} label={o} selected={data.bodyLocation === o} onClick={() => setData({ ...data, bodyLocation: o })} />
            ))}
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">When did this feeling start?</h2>
            <p className="text-muted-foreground text-xs mb-4">Try to recall</p>
            {["Just now — something specific triggered it", "A few hours ago", "Since I woke up", "Been there for a few days", "I genuinely don't know"].map((o) => (
              <SelectOption key={o} label={o} selected={data.feelingStart === o} onClick={() => setData({ ...data, feelingStart: o })} />
            ))}
          </div>
        );
      case 6: {
        const isMultiple = data.driver.includes("Multiple things at once");
        const driverOptions = [
          "Work / studies / performance pressure",
          "Relationship / friendship / a person",
          "Own thoughts about myself",
          "Health (mine / someone else's)",
          "Nothing specific",
          "Multiple things at once",
        ];
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What seems to be driving this feeling?</h2>
            <p className="text-muted-foreground text-xs mb-4">{isMultiple ? "Select all that apply" : "Select one"}</p>
            {driverOptions.map((o) => (
              <MultiSelectOption
                key={o}
                label={o}
                selected={data.driver.includes(o)}
                onClick={() => toggleDriverOption(o)}
              />
            ))}
            {isMultiple && (
              <input
                type="text"
                value={data.driverOther}
                onChange={(e) => setData({ ...data, driverOther: e.target.value })}
                placeholder="Others (optional)"
                className="w-full px-5 py-4 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>
        );
      }
      case 7:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">How is this feeling affecting you right now?</h2>
            <p className="text-muted-foreground text-xs mb-4">What resonates the most?</p>
            {["Can't focus / concentrate", "Feels like withdrawing / isolating", "I'm going through motions but not present", "I physically feel unwell (headache, stress, fatigue)", "Spiralling in my thoughts"].map((o) => (
              <SelectOption key={o} label={o} selected={data.affect === o} onClick={() => setData({ ...data, affect: o })} />
            ))}
          </div>
        );
      case 8:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">Have you felt this way before?</h2>
            <p className="text-muted-foreground text-xs mb-4">Think back</p>
            {["Yes, this is very familiar — it comes back often", "Yes, but usually milder than this", "Rarely — this feels unusual for me", "No, this is new for me"].map((o) => (
              <SelectOption key={o} label={o} selected={data.feltBefore === o} onClick={() => setData({ ...data, feltBefore: o })} />
            ))}
          </div>
        );
      case 9:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What have you already tried?</h2>
            <p className="text-muted-foreground text-xs mb-4">Select all that apply</p>
            {["Nothing yet", "Distraction (scrolling, music, TV)", "Talking to someone about it", "Exercise / movement", "Food / drink", "Breathing / meditation / sleeping"].map((o) => (
              <MultiSelectOption
                key={o}
                label={o}
                selected={data.triedAlready.includes(o)}
                onClick={() => toggleTriedOption(o)}
              />
            ))}
          </div>
        );
      case 10:
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground mb-1">What kind of support feels right to you?</h2>
            <p className="text-muted-foreground text-xs mb-4">We'll tailor your experience</p>
            {[
              "Something physical that I can do with my body",
              "Something I can think through mentally",
              "A calming practice / ritual",
              "Something quick — under 5 minutes",
              "Something I can do tonight before sleeping",
            ].map((o) => (
              <SelectOption key={o} label={o} selected={data.supportType === o} onClick={() => setData({ ...data, supportType: o })} />
            ))}
          </div>
        );
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
          <p className="text-foreground text-sm font-medium leading-relaxed">
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

export default ReflectiveQuestions;
