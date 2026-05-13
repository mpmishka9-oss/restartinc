import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock, Check, Sparkles, ExternalLink } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

// ---------- 21-day content (placeholder) ----------
type DayContent = {
  day: number;
  title: string;
  neuro: { name: string; explanation: string; source: { label: string; url: string } };
  ayurveda: { name: string; explanation: string; source: { label: string; url: string } };
};

const PLACEHOLDER_SOURCE = {
  label: "Source — coming soon",
  url: "https://www.ncbi.nlm.nih.gov/",
};

const DAYS: DayContent[] = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    title:
      day <= 7
        ? "Prove it works"
        : day <= 14
          ? "Deepen the experience"
          : "Feel the stakes",
    neuro: {
      name: `Day ${day} · Neuroplasticity exercise`,
      explanation:
        "A short, evidence-based practice to rewire your stress response. Full explanation arriving with the new content drop.",
      source: PLACEHOLDER_SOURCE,
    },
    ayurveda: {
      name: `Day ${day} · Ayurvedic solution`,
      explanation:
        "A grounding ritual matched to your dosha. Full explanation arriving with the new content drop.",
      source: PLACEHOLDER_SOURCE,
    },
  };
});

const FREE_DAYS = 3;

// ---------- Mountain illustration ----------
const Mountain = ({ currentDay }: { currentDay: number }) => {
  // Path goes from bottom-left up to summit. Place markers along it.
  const stops = [
    { day: 1, x: 110, y: 360, label: "You are here" },
    { day: 7, x: 175, y: 270, label: "7 days" },
    { day: 14, x: 130, y: 180, label: "14 days" },
    { day: 21, x: 200, y: 90, label: "Summit" },
  ];
  return (
    <div className="relative w-full" style={{ aspectRatio: "320 / 380" }}>
      <svg viewBox="0 0 320 400" className="w-full h-full">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fef9d7" />
            <stop offset="60%" stopColor="#cfe1ee" />
            <stop offset="100%" stopColor="#7fa9c7" />
          </linearGradient>
          <linearGradient id="mt" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#a3b8d4" />
            <stop offset="100%" stopColor="#3e5a8a" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff8c2" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fff8c2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="path" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffbe5" />
            <stop offset="100%" stopColor="#e3edf7" />
          </linearGradient>
        </defs>
        <rect width="320" height="400" fill="url(#sky)" />
        <circle cx="200" cy="80" r="55" fill="url(#sun)" />
        {/* mountain silhouette */}
        <path
          d="M 0 400 L 0 320 Q 60 260 110 280 Q 150 230 175 250 Q 210 180 230 200 L 260 90 L 290 200 Q 310 250 320 300 L 320 400 Z"
          fill="url(#mt)"
          opacity="0.95"
        />
        {/* winding path */}
        <path
          d="M 60 395 C 90 360, 140 380, 110 340 S 200 310, 175 270 S 100 220, 130 180 S 230 150, 200 90"
          stroke="url(#path)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        {stops.map((s) => {
          const reached = s.day <= currentDay;
          return (
            <g key={s.day}>
              <circle
                cx={s.x}
                cy={s.y}
                r={s.day === currentDay ? 14 : 10}
                fill={reached ? "#fffbe5" : "rgba(255,255,255,0.45)"}
                stroke={s.day === currentDay ? "#F5F0A0" : "rgba(255,255,255,0.7)"}
                strokeWidth={s.day === currentDay ? 3 : 1.5}
              />
              <text
                x={s.x}
                y={s.y + 3}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#1A2A4A"
              >
                {s.day}
              </text>
            </g>
          );
        })}
      </svg>
      {/* "You are here" pill */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 8,
          transform: "translateX(-50%)",
          background: "rgba(26,42,74,0.85)",
          color: "#fffbe5",
          fontSize: 12,
          padding: "6px 14px",
          borderRadius: 999,
          backdropFilter: "blur(8px)",
        }}
      >
        Day {currentDay} · You are here
      </div>
    </div>
  );
};

// ---------- Day card ----------
const DayCard = ({
  d,
  status,
  expanded,
  onToggle,
  onLockedTap,
  onStartWithDidi,
}: {
  d: DayContent;
  status: "done" | "active" | "locked";
  expanded: boolean;
  onToggle: () => void;
  onLockedTap: () => void;
  onStartWithDidi: () => void;
}) => {
  const locked = status === "locked";
  const done = status === "done";
  const active = status === "active";

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: active
          ? "rgba(245,240,160,0.7)"
          : done
            ? "rgba(29,158,117,0.3)"
            : "rgba(255,255,255,0.18)",
        background: active
          ? "rgba(245,240,160,0.12)"
          : done
            ? "rgba(29,158,117,0.08)"
            : "rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={locked ? onLockedTap : onToggle}
        className="w-full flex items-center gap-3 p-4 text-left btn-press"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
          style={{
            background: done
              ? "#1D9E75"
              : active
                ? "#F5F0A0"
                : "rgba(255,255,255,0.12)",
            color: active ? "#1A2A4A" : "white",
          }}
        >
          {done ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : d.day}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-yellow-100">Day {d.day}</p>
          <p className="text-rs-muted text-[12px] truncate text-yellow-100">
            {locked ? "Unlock with Pro" : `${d.title} · Neuro + Ayurveda`}
          </p>
        </div>
        {locked ? (
          <Lock className="w-4 h-4 text-rs-cream" />
        ) : expanded ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-3"
          >
            <ExerciseBlock
              kind="Neuroplasticity"
              icon="🧠"
              name={d.neuro.name}
              explanation={d.neuro.explanation}
              source={d.neuro.source}
            />
            <ExerciseBlock
              kind="Ayurveda"
              icon="🌿"
              name={d.ayurveda.name}
              explanation={d.ayurveda.explanation}
              source={d.ayurveda.source}
            />
            <button
              onClick={onStartWithDidi}
              className="w-full mt-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
              style={{ background: "#F5F0A0", color: "#1A2A4A" }}
            >
              <Sparkles className="w-4 h-4" />
              Let's do this together with DIDI
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExerciseBlock = ({
  kind,
  icon,
  name,
  explanation,
  source,
}: {
  kind: string;
  icon: string;
  name: string;
  explanation: string;
  source: { label: string; url: string };
}) => (
  <div
    className="rounded-xl p-3"
    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
  >
    <div className="flex items-center gap-2 mb-1">
      <span className="text-base">{icon}</span>
      <span
        className="text-[10px] tracking-[0.16em] uppercase font-semibold"
        style={{ color: "#F5F0A0" }}
      >
        {kind}
      </span>
    </div>
    <p className="text-[14px] font-medium text-yellow-100">{name}</p>
    <p className="text-rs-muted text-[12px] mt-1 leading-relaxed text-yellow-100">{explanation}</p>
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 mt-2 text-[11px]"
      style={{ color: "#B8CCE8" }}
    >
      {source.label} <ExternalLink className="w-3 h-3" />
    </a>
  </div>
);

// ---------- Upgrade modal ----------
const UpgradeModal = ({ onClose }: { onClose: () => void }) => {
  const nav = useNavigate();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,18,40,0.7)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1A2A4A",
          width: "100%",
          maxWidth: 440,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "28px 24px 36px",
          border: "1px solid rgba(245,240,160,0.3)",
        }}
      >
        <div
          style={{ width: 44, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 18px" }}
        />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(245,240,160,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock className="w-6 h-6" style={{ color: "#F5F0A0" }} />
          </div>
        </div>
        <h2 className="text-white text-center text-[20px] font-bold">
          Unlock the full 21-day journey
        </h2>
        <p className="text-rs-muted text-center text-[13px] mt-2 px-2">
          You've completed the first 3 days — the hardest part. Days 4–21 unlock the deeper
          neuroplasticity and Ayurvedic practices that make this stick.
        </p>
        <div
          className="mt-5 p-4 rounded-2xl"
          style={{ background: "rgba(245,240,160,0.08)", border: "1px solid rgba(245,240,160,0.3)" }}
        >
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "#F5F0A0" }}>
            21-Day Reset
          </p>
          <p className="mt-1">
            <span className="text-[26px] font-bold text-white">₹21</span>
            <span className="text-[12px] text-white/60 ml-2">for days 4–21</span>
          </p>
          <p className="text-[11px] text-white/50 mt-1">Then ₹199/mo to maintain your habit.</p>
        </div>
        <button
          onClick={() => nav("/pricing")}
          className="w-full mt-5 py-3 rounded-full font-semibold"
          style={{ background: "#F5F0A0", color: "#1A2A4A" }}
        >
          Continue my reset →
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-[13px] text-white/60"
        >
          Not now
        </button>
      </motion.div>
    </div>
  );
};

// ---------- Screen ----------
const JourneyScreen = () => {
  const { profile } = useProfile();
  const { isActive } = useSubscription();
  const nav = useNavigate();

  const day = profile?.current_day ?? 1;
  const simDay = useMemo(() => {
    try {
      const v = parseInt(localStorage.getItem("restart_day") || String(day));
      return Number.isFinite(v) && v > 0 ? v : day;
    } catch {
      return day;
    }
  }, [day]);

  const completedDaysLs: number[] = useMemo(() => {
    try {
      const raw = localStorage.getItem("restart_completed_days");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, []);

  const [localPro, setLocalPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem("restart_pro") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const onStorage = () => {
      try {
        setLocalPro(localStorage.getItem("restart_pro") === "true");
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const isPro = isActive || localPro;

  const [open, setOpen] = useState<number | null>(simDay);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const dayStatus = (n: number): "done" | "active" | "locked" => {
    if (!isPro && n > FREE_DAYS) return "locked";
    if (completedDaysLs.includes(n)) return "done";
    if (n < simDay) return "done";
    if (n === simDay) return "active";
    return "locked";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen pb-28 px-5"
      style={{ paddingTop: 54, background: "hsl(var(--rs-navy))" }}
    >
      <TopBar />
      <h1 className="text-[24px] font-bold text-white mt-2">Your Ascent</h1>
      <p className="text-rs-muted text-[13px] mt-1">
        Day {simDay} of 21 — one step at a time.
      </p>

      <div className="mt-4 rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <Mountain currentDay={simDay} />
      </div>

      <div className="mt-6 space-y-2.5">
        {DAYS.map((d) => (
          <DayCard
            key={d.day}
            d={d}
            status={dayStatus(d.day)}
            expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)}
            onLockedTap={() => setShowUpgrade(true)}
            onStartWithDidi={() =>
              nav(`/practices?day=${d.day}`)
            }
          />
        ))}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <BottomNav />

      {import.meta.env.VITE_RAZORPAY_KEY_ID?.includes("test") && (
        <DevDayPanel simDay={simDay} />
      )}
    </motion.div>
  );
};

export default JourneyScreen;

// ---------- Dev panel (test mode only) ----------
const DevDayPanel = ({ simDay }: { simDay: number }) => {
  const set = (d: number, completed: number[], pro: boolean) => {
    localStorage.setItem("restart_day", String(d));
    localStorage.setItem("restart_completed_days", JSON.stringify(completed));
    localStorage.setItem("restart_pro", pro ? "true" : "false");
    window.location.reload();
  };
  const baseBtn: React.CSSProperties = {
    fontSize: 11,
    padding: "5px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    margin: 2,
  };
  const activeBtn: React.CSSProperties = {
    ...baseBtn,
    background: "#F5F0A0",
    color: "#1A2A4A",
    borderColor: "#F5F0A0",
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 16,
        background: "#1A2A4A",
        borderRadius: 12,
        padding: "12px 14px",
        zIndex: 99,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
        Dev: Simulate
      </div>
      <div style={{ display: "flex" }}>
        <button style={simDay === 1 ? activeBtn : baseBtn} onClick={() => set(1, [], false)}>D1</button>
        <button style={simDay === 3 ? activeBtn : baseBtn} onClick={() => set(3, [1, 2, 3], false)}>D3 ✓</button>
        <button style={simDay >= 4 && !localStorage.getItem("restart_pro")?.includes("true") ? activeBtn : baseBtn} onClick={() => set(4, [1, 2, 3], false)}>D4 lock</button>
        <button style={baseBtn} onClick={() => set(simDay, [], true)}>Pro</button>
      </div>
    </div>
  );
};
