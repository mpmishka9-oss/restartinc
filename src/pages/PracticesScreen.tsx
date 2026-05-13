import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const PracticesScreen = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const day = params.get("day") ?? "1";

  return (
    <div className="phone-frame min-h-screen pb-28 px-5 pt-12 bg-rs-navy">
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-1 text-white/70 text-[13px] mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div
        className="rounded-3xl p-6 text-center"
        style={{
          background: "rgba(245,240,160,0.08)",
          border: "1px solid rgba(245,240,160,0.3)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(245,240,160,0.18)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles className="w-7 h-7" style={{ color: "#F5F0A0" }} />
        </div>
        <p
          className="mt-4 text-[10px] tracking-[0.18em] uppercase font-semibold"
          style={{ color: "#F5F0A0" }}
        >
          Day {day} · Guided session
        </p>
        <h1 className="text-white text-[22px] font-bold mt-2">
          DIDI will guide you
        </h1>
        <p className="text-rs-muted text-[13px] mt-3 leading-relaxed">
          DIDI will walk you through today's neuroplasticity exercise and Ayurvedic
          ritual together — one breath at a time. Full guided flow arrives with the new
          content drop.
        </p>
        <button
          onClick={() => nav("/journey")}
          className="mt-6 px-6 py-3 rounded-full font-semibold"
          style={{ background: "#F5F0A0", color: "#1A2A4A" }}
        >
          Back to journey
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default PracticesScreen;
