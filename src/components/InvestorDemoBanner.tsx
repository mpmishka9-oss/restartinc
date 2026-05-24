import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { isInvestorDemoActive, exitInvestorDemo } from "@/lib/investorDemo";

const InvestorDemoBanner = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!isInvestorDemoActive() || !user) return null;

  const handleExit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await exitInvestorDemo(user.id);
      toast.success("Original profile restored");
      window.location.replace("/home");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to restore");
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(254,255,175,0.92)",
        color: "#1a1a1a",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        padding: "4px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <span>INVESTOR DEMO</span>
      <button
        onClick={handleExit}
        disabled={busy}
        style={{
          background: "transparent",
          border: "none",
          color: "#1a1a1a",
          textDecoration: "underline",
          cursor: busy ? "wait" : "pointer",
          fontSize: 11,
          fontWeight: 600,
          padding: 0,
        }}
      >
        {busy ? "Restoring…" : "Exit Demo"}
      </button>
    </div>
  );
};
export default InvestorDemoBanner;