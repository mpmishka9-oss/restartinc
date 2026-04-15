import logo from "@/assets/logo.png";
import { Shield } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <img src={logo} alt="reStart" className="w-48 h-48 object-contain mb-8 rounded-2xl" />
        
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Welcome to reStart
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-10">
          Your journey to a better you begins here.
        </p>

        {/* Privacy Promise */}
        <div className="w-full bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="font-semibold text-foreground text-sm">Our Privacy Promise</h2>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your data stays yours. We never sell or share your personal information. 
            Everything you share here is encrypted and used solely to personalize your experience.
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
      >
        Let's Begin
      </button>
    </div>
  );
};

export default WelcomeScreen;
