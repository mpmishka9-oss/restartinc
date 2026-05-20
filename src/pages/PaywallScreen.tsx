import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";

/**
 * Up-front ₹79 paywall shown after onboarding, before Day 1 of the journey
 * unlocks. On payment success we write restartPaid=true to localStorage and
 * forward into /journey.
 */
const PaywallScreen = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("test-mode-status")
      .then(({ data }) => {
        if (!cancelled && data?.enabled === true) setTestMode(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const startCheckout = () => {
    initiateRazorpayCheckout({
      amount: 7900, // ₹79 in paise
      planId: "restart_3day_79",
      userName: profile?.name ?? "",
      userEmail: user?.email ?? "",
      onSuccess: () => {
        try { localStorage.setItem("restartPaid", "true"); } catch {}
        toast.success("Payment successful — your 3-Day Reset is unlocked");
        nav("/journey", { replace: true });
      },
      onFailure: (e) => {
        const msg = typeof e === "string" ? e : "Payment didn't go through. Please try again.";
        if (msg !== "User closed payment window") toast.error(msg);
      },
    });
  };

  return (
    <div
      className="phone-frame min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #fdfcb8 0%, #e6d68f 14%, #7B9BD6 55%, #1A2A4A 100%)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7"
        style={{
          background: "rgba(15,12,40,0.92)",
          border: "1px solid rgba(253,252,184,0.35)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <Lock className="w-7 h-7 mx-auto" style={{ color: "#fdfcb8" }} />
        <p
          className="text-[10px] tracking-[0.22em] uppercase font-bold mt-4"
          style={{ color: "rgba(245,225,160,0.85)" }}
        >
          Unlock your reset
        </p>
        <h1
          className="text-[24px] font-bold mt-2 leading-tight"
          style={{ color: "#fdfcb8" }}
        >
          3 days. 6 practices.
          <br />Your nervous system, reset.
        </h1>
        <p className="text-[14px] mt-3" style={{ color: "#ffffff" }}>
          One-time ₹79 unlocks all 3 days, both practices each day, and Didi's
          guided overlays — personalised to your dosha, chronotype and daily
          check-in.
        </p>

        <div
          className="mt-5 flex items-baseline justify-center gap-2"
          style={{ color: "#fdfcb8" }}
        >
          <span className="text-[34px] font-bold leading-none">₹79</span>
          <span className="text-[12px]" style={{ color: "#ffffff" }}>
            one-time · no subscription
          </span>
        </div>

        <button
          onClick={startCheckout}
          className="mt-6 w-full py-3.5 rounded-xl font-bold btn-press inline-flex items-center justify-center gap-2"
          style={{ background: "#F5E1A0", color: "#1A2A4A", fontSize: 15 }}
        >
          Start my 3-Day Reset <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] mt-3" style={{ color: "#ffffff" }}>
          Secure payment via Razorpay
        </p>
        {testMode && (
          <button
            onClick={async () => {
              try { localStorage.setItem("restartPaid", "true"); } catch {}
              if (user) {
                try {
                  await supabase
                    .from("profiles")
                    .update({ payment_status: true } as any)
                    .eq("id", user.id);
                } catch {}
              }
              nav("/journey", { replace: true });
            }}
            className="mt-3 mx-auto block text-[11px] hover:underline"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Skip payment (test mode)
          </button>
        )}
      </div>
    </div>
  );
};

export default PaywallScreen;