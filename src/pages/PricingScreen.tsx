import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { toast } from "sonner";

const PricingScreen = () => {
  const nav = useNavigate();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const [portalLoading, setPortalLoading] = useState(false);
  const [view, setView] = useState<"ambitious" | "emotional">((profile?.path as any) ?? "ambitious");
  const streak = profile?.streak_days ?? 0;

  const headline = view === "ambitious"
    ? "Your brain is 21 days more wired for focus than when you started."
    : "You've built 21 days of emotional regulation. Don't let it slip.";

  const handleSubscribe = async (priceId: "pro_monthly" | "pro_annual") => {
    if (!user) { nav("/"); return; }
    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/home?checkout=success`,
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not open checkout");
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { environment: getPaddleEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message ?? "Could not open portal");
      window.open(data.url as string, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPriceId = subscription?.price_id ?? null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen pb-12" style={{ paddingTop: 44 }}>
      <TopBar />
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
        {isActive && (
          <div className="rounded-xl p-4 bg-rs-cream/15 border border-rs-cream text-white text-[13px]">
            You're on Restart Pro ({currentPriceId === "pro_annual" ? "Annual" : "Monthly"}).
            <button onClick={handleManage} disabled={portalLoading}
              className="block mt-2 text-rs-cream underline disabled:opacity-50">
              {portalLoading ? "Opening…" : "Manage subscription"} →
            </button>
          </div>
        )}

        <Card label="FREE" price="₹0" sub="Forever"
          features={["Chronotype + daily tip", "Community view only", "Reset Report access", "1 ritual/week"]}
          cta="Continue free" filled={false}
          onClick={() => nav("/home")} />

         <Card label="PRO MONTHLY" badge="Most popular" price="₹199" sub="/month"
           subline="Less than ₹7 a day"
           features={["Full daily plan", "Streak continuity", "Community library", "Weekly reflections", "Monthly re-assessment"]}
           cta={
             currentPriceId === "pro_monthly" ? "Current plan" :
             currentPriceId === "pro_annual" ? "Switch to monthly" :
             "Upgrade to Pro"
           }
          disabled={currentPriceId === "pro_monthly" || checkoutLoading}
          loading={checkoutLoading}
          onClick={() => handleSubscribe("pro_monthly")}
          filled highlight />

        <Card label="PRO ANNUAL" price="₹999" sub="/year"
          subline="₹2.7 a day · less than a chai"
          features={["Everything in Pro", "Save ₹1,389/year vs monthly", "Best value"]}
          cta={
            currentPriceId === "pro_annual" ? "Current plan" :
            currentPriceId === "pro_monthly" ? "Upgrade to annual" :
            "Go annual"
          }
          disabled={currentPriceId === "pro_annual" || checkoutLoading}
          loading={checkoutLoading}
          onClick={() => handleSubscribe("pro_annual")}
          filled />

         <p className="text-center text-rs-muted text-[11px] mt-4">
           Secure checkout · UPI · Cards · Net Banking
         </p>
         <div className="flex justify-center gap-4 mt-2">
           <button onClick={() => nav("/terms")} className="text-rs-muted text-[10px] underline">Terms</button>
           <button onClick={() => nav("/privacy")} className="text-rs-muted text-[10px] underline">Privacy</button>
           <button onClick={() => nav("/refund")} className="text-rs-muted text-[10px] underline">Refunds</button>
         </div>
         <p className="text-center text-rs-cream text-[12px] underline mt-4">Questions? WhatsApp us →</p>
      </div>
    </motion.div>
  );
};

const Card = ({ label, badge, price, sub, subline, tag, features, cta, filled, highlight, onClick, disabled, loading }: {
  label: string; badge?: string; price: string; sub: string; subline?: string; tag?: string;
  features: string[]; cta: string; filled: boolean; highlight?: boolean;
  onClick?: () => void; disabled?: boolean; loading?: boolean;
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
    <button onClick={onClick} disabled={disabled}
      className={`w-full mt-5 py-3 ${filled ? "btn-cream" : "btn-outline-white"} flex items-center justify-center gap-2 disabled:opacity-50`}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{cta} →</>}
    </button>
  </div>
);

export default PricingScreen;
