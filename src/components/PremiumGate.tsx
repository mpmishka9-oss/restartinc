import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

export function PremiumLockBanner({ feature }: { feature: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav("/home")}
      className="w-full mt-4 rounded-xl p-3 bg-rs-cream/15 border border-rs-cream text-left flex items-center gap-3"
    >
      <Lock className="w-4 h-4 text-rs-navy flex-shrink-0" />
      <span className="flex-1 text-white text-[13px]">
        <strong>{feature}</strong> is part of Restart Pro.
      </span>
      <ArrowRight className="w-4 h-4 text-rs-cream" />
    </button>
  );
}