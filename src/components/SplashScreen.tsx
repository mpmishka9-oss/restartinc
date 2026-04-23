import { useEffect } from "react";
import logo from "@/assets/restart-logo.png";

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-gradient">
      <div className="flex flex-col items-center" style={{ animation: "fade-up 800ms ease-out both" }}>
        <img src={logo} alt="reStart" className="w-44 h-44 object-contain drop-shadow-lg" />
      </div>
      <p className="font-serif italic text-white/95 text-lg mt-4 tracking-wide" style={{ animation: "fade-up 800ms ease-out 1000ms both" }}>
        A little support, whenever you need it
      </p>
    </div>
  );
};

export default SplashScreen;
