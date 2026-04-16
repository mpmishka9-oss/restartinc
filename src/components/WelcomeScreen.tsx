import { useState } from "react";
import logo from "@/assets/logo.png";
import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <img src={logo} alt="reStart" className="w-48 h-48 object-contain mb-8 rounded-2xl" />
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2 font-sans rounded-none bg-sidebar-accent">
          Welcome to reStart
        </h1>
        <p className="text-center text-sm mb-10 text-foreground">
          Helping your thoughts turn into momentum
        </p>

        {/* Privacy Promise */}
        <div className="w-full bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="font-semibold text-sm text-primary-foreground">Our Privacy Promise</h2>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your data stays yours. We never sell or share your personal information. 
            Everything you share here is encrypted and used solely to personalize your experience.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <div className="w-full max-w-sm flex items-start gap-3 mb-10">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="agree" className="text-xs leading-relaxed cursor-pointer text-foreground">
            I agree these suggestions are for well-being, not medical guidance, and I'll use them at my own discretion.
          </label>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!agreed}
        className="w-full max-w-sm py-4 rounded-2xl text-primary-foreground font-semibold text-base shadow-lg hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-foreground"
      >
        Let's Begin
      </button>
    </div>
  );
};

export default WelcomeScreen;
