import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const PricingScreen = () => {
  const nav = useNavigate();
  const { profile } = useProfile();
  const [view, setView] = useState<"ambitious" | "emotional">((profile?.path as any) ?? "ambitious");
  const streak = profile?.streak_days ?? 0;

  const headline = view === "ambitious"
    ? "Your brain is 21 days more wired for focus than when you started."
    : "You've built 21 days of emotional regulation. Don't let it slip.";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen pb-12">
      <div className="bg-rs-navy px-5 pt-10 pb-8">
        <button onClick={() => nav(-1)} className="text-white/70 mb-4 inline-flex items-center gap-1 text-[13px]">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-white text-[24px] font-bold leading-tight">Your 21-day reset worked. Don't lose it.</h1>
        <p className="text-rs-muted text-[14px] mt-2">You showed up for {streak} days. That matters.</p>
        <p className="text-rs-cream text-[14px] mt-4 leading-snug font-medium">{headline}</p>

        <div className="mt-5 flex gap-2 p-1 rounded-xl bg-white/10 border border-white/15">
          {(["ambitious","emotional"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold ${
                view === v ? "bg-rs-cream text-rs-navy" : "text-white/60"
              }`}>{v === "ambitious" ? "Ambitious plan" : "Stressed plan"}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        <Card label="FREE" price="₹0" sub="Forever"
          features={["Chronotype + daily tip", "Community view only", "Reset Report access", "1 ritual/week"]}
          cta="Continue free" filled={false} />

        <Card label="PRO MONTHLY" badge="Most popular" price="₹21" sub="first month, then ₹1,389/mo"
          subline="Less than ₹7 a day"
          features={["Full daily plan", "Streak continuity", "Community library", "Weekly reflections", "Monthly re-assessment"]}
          cta="Start Pro" filled highlight />

        <Card label="PRO ANNUAL" price="₹999" sub="/year"
          subline="₹2.7 a day · less than a chai"
          tag="Founding member: ₹799 for first 500 users"
          features={["Everything in Pro", "Save ₹1,389/year", "Founding member price"]}
          cta="Get founding price" filled />

        <p className="text-center text-rs-muted text-[11px] mt-4">Razorpay · UPI · Cards · Net Banking</p>
        <p className="text-center text-rs-cream text-[12px] underline">Questions? WhatsApp us →</p>
      </div>
    </motion.div>
  );
};

const Card = ({ label, badge, price, sub, subline, tag, features, cta, filled, highlight }: {
  label: string; badge?: string; price: string; sub: string; subline?: string; tag?: string;
  features: string[]; cta: string; filled: boolean; highlight?: boolean;
}) => (
  <div className={`rounded-2xl p-5 border ${highlight ? "border-rs-cream bg-white/15" : "border-white/25 bg-white/8"} relative`}>
    {badge && (
      <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-rs-cream text-rs-navy text-[10px] font-bold">{badge}</span>
    )}
    <p className="text-rs-cream text-[10px] tracking-[0.2em] uppercase font-bold">{label}</p>
    <div className="mt-2 flex items-baseline gap-1.5">
      <span className="text-white text-[28px] font-bold">{price}</span>
      <span className="text-rs-muted text-[13px]">{sub}</span>
    </div>
    {subline && <p className="text-rs-muted text-[12px] mt-1">{subline}</p>}
    {tag && <p className="text-rs-cream text-[11px] mt-2 italic">{tag}</p>}
    <ul className="mt-4 space-y-2">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-white text-[13px]">
          <Check className="w-4 h-4 text-rs-cream mt-0.5 flex-shrink-0" /> {f}
        </li>
      ))}
    </ul>
    <button className={`w-full mt-5 py-3 ${filled ? "btn-cream" : "btn-outline-white"} flex items-center justify-center gap-2`}>
      {cta} →
    </button>
  </div>
);

export default PricingScreen;
