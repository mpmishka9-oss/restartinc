import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { useSubscription } from "@/hooks/useSubscription";
import { getPracticesForState } from "@/lib/getPracticesForState";
import { useAuth } from "@/hooks/useAuth";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";

interface DayPlan {
  day: number;
  morning: string;
  neuro: string;
  ayurveda: string;
  evening: string;
  prompt: string;
  // phase 2
  midday?: string;
  community?: string;
  focusWindow?: string;
  reflection?: string;
}

const PHASE_1: DayPlan[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  morning: "5 min Brahmi tea + intention setting",
  neuro: ["Friction Sprint — 10 min avoided task", "Single-Sense Focus Drill", "Physiological Sigh × 5", "Cold-water wrists", "Observer Perspective Bridging", "Cognitive Reappraisal Journal", "Identity Rewriting"][i],
  ayurveda: ["Nasya oil drops before work", "Tulsi tea midday", "Shankhpushpi milk pre-sleep", "Abhyanga foot massage", "Triphala water on rising", "Ghee + turmeric warm milk", "Nadi Shodhana 5 min"][i],
  evening: "Shankhpushpi milk + 3 reflection sentences",
  prompt: [
    "What does showing up look like for you today?",
    "What's one thing you proved to yourself yesterday?",
    "Where did you feel most alive today?",
    "What did the day ask of you?",
    "What kept you here today?",
    "What's quietly shifting in you?",
    "What's a new pattern you can feel taking root?",
  ][i],
}));

const PHASE_2: DayPlan[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 8,
  morning: "Brahmi tea + gratitude triple",
  neuro: ["Dual N-Back drill", "HIIT 4-minute set", "Ultradian Reset 90 min", "Interleaved Learning block", "Friction Sprint × 2", "Deliberate Discomfort", "Reflection synthesis"][i],
  ayurveda: ["Nasya + Nadi Shodhana", "Tulsi tea + walk", "Shankhpushpi milk", "Abhyanga full-body", "Cold rinse practice", "Ghee + turmeric", "Tongue scrape ritual"][i],
  evening: "Light dinner + screen-off 60 min before sleep",
  prompt: ["A community moment to share", "Notice the midday shift", "Hold the focus window", "Track your grace days", "Notice what's softer", "What would future-you thank you for?", "Mid-point reflection"][i],
  midday: "5-min reset",
  community: "Share one win in your channel",
  focusWindow: "25-min deep work block",
  reflection: i === 6 ? "You showed up for 14 days. The rhythm is yours now." : undefined,
}));

const PHASE_3: DayPlan[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 15,
  morning: "Choose your own anchor today",
  neuro: ["Identity statement aloud", "Goal review + visualisation", "Hard task first principle", "Single-task discipline", "Recovery-led day", "Stretch + cold rinse", "Synthesis: 21-day report prep"][i],
  ayurveda: ["Nasya + warm oil", "Tulsi steam", "Shankhpushpi infusion", "Abhyanga + Pranayama", "Quiet day — light food", "Triphala reset", "Final ritual: gratitude bath"][i],
  evening: "Long Nadi Shodhana 10 min",
  prompt: [
    "I am someone who shows up.",
    "I trust the process I built.",
    "My body knows what it needs.",
    "I am calmer than I was 14 days ago.",
    "My focus is stronger than my distractions.",
    "I built this. No one did it for me.",
    "Day 21 — what becomes possible now?",
  ][i],
  reflection: i === 6 ? "Day 21 — your full personalised Reset Report is ready." : undefined,
}));

const DayRow = ({ d, status, expanded, onToggle, accent, checks, onCheck }: {
  d: DayPlan; status: "locked" | "active" | "done"; expanded: boolean;
  onToggle: () => void; accent: string;
  checks: Record<string, boolean>;
  onCheck: (label: string, value: boolean) => void;
}) => {
  const locked = status === "locked";
  return (
    <div className={`rounded-2xl border ${status === "active" ? "border-rs-cream bg-white/15" : "border-white/20 bg-white/8"} overflow-hidden`}>
      <button onClick={locked ? undefined : onToggle}
        className="w-full flex items-center gap-3 p-4 text-left btn-press disabled:cursor-not-allowed"
        disabled={locked}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
          style={{ background: status === "done" ? "hsl(var(--rs-green))" : status === "active" ? accent : "rgba(255,255,255,0.15)", color: status === "active" ? "hsl(var(--rs-navy))" : "white" }}>
          {status === "done" ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : d.day}
        </div>
        <div className="flex-1">
          <p className="text-white text-[14px] font-semibold">Day {d.day}</p>
          <p className="text-rs-muted text-[12px]">{locked ? (d.day > 3 ? "Unlock with Pro" : "Unlocks soon") : d.morning}</p>
        </div>
        {!locked && (expanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />)}
      </button>
      {expanded && !locked && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 space-y-2">
          <Task label="Morning Anchor" body={d.morning} checked={!!checks["Morning Anchor"]} onChange={(v) => onCheck("Morning Anchor", v)} />
          {(() => {
            const triad = getPracticesForState("default");
            return (
              <div className="mt-2 space-y-1.5">
                <TriadRow icon="🧠" label="NEUROSCIENCE" name={triad.neuro.name} duration={triad.neuro.duration} />
                <TriadRow icon="🌿" label="AYURVEDA" name={triad.ayurveda.name} duration={triad.ayurveda.duration} />
                <TriadRow icon="💨" label="BREATHWORK" name={triad.breathwork.name} duration={triad.breathwork.duration} />
              </div>
            );
          })()}
          {d.midday && <Task label="Midday Reset" body={d.midday} checked={!!checks["Midday Reset"]} onChange={(v) => onCheck("Midday Reset", v)} />}
          {d.focusWindow && <Task label="Focus Window" body={d.focusWindow} checked={!!checks["Focus Window"]} onChange={(v) => onCheck("Focus Window", v)} />}
          {d.community && <Task label="Community" body={d.community} checked={!!checks["Community"]} onChange={(v) => onCheck("Community", v)} />}
          <Task label="Evening Wind-Down" body={d.evening} checked={!!checks["Evening Wind-Down"]} onChange={(v) => onCheck("Evening Wind-Down", v)} />
          <div className="mt-3 p-3 rounded-xl bg-rs-navy/40 border border-white/15">
            <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">Daily prompt</p>
            <p className="text-white text-[13px] mt-1 italic">{d.prompt}</p>
          </div>
          {d.reflection && (
            <div className="mt-2 p-3 rounded-xl bg-rs-cream/15 border border-rs-cream">
              <p className="text-white text-[13px]">{d.reflection}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const Task = ({ label, body, checked, onChange }: { label: string; body: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-start gap-3 py-2">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-[hsl(var(--rs-cream))]" />
    <div className="flex-1">
      <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">{label}</p>
      <p className="text-white text-[13px]">{body}</p>
    </div>
  </div>
);

const TriadRow = ({ icon, label, name, duration }: { icon: string; label: string; name: string; duration: string }) => (
  <div className="flex items-center gap-3 py-1.5 px-2 rounded-lg bg-white/5">
    <span className="text-base">{icon}</span>
    <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold w-24 flex-shrink-0">{label}</p>
    <p className="text-white text-[13px] flex-1">{name} — <span className="text-white/60">{duration}</span></p>
  </div>
);

const PaywallGate = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    if (!user) { nav("/pricing"); return; }
    setLoading(true);
    initiateRazorpayCheckout({
      amount: 2100,
      planId: import.meta.env.VITE_RAZORPAY_PLAN_ID,
      userName: (user as any)?.user_metadata?.name || user.email || "",
      userEmail: user.email || "",
      onSuccess: (paymentId) => {
        localStorage.setItem("restart_pro", "true");
        localStorage.setItem("restart_payment_id", paymentId);
        setLoading(false);
        nav("/home");
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
        setLoading(false);
        toast.error("Payment was not completed");
      },
    });
  };

  return (
    <div
      className="my-4 rounded-2xl p-6"
      style={{
        border: "1.5px solid #F5F0A0",
        background: "rgba(245,240,160,0.08)",
        borderRadius: 16,
      }}
    >
      <div className="flex justify-center"><Lock className="w-7 h-7 text-rs-cream" /></div>
      <p className="text-center font-bold text-[18px] mt-3" style={{ color: "#1A2A4A" }}>
        Days 4–21 are waiting for you.
      </p>
      <p className="text-center text-[13px] mt-1" style={{ color: "rgba(26,42,74,0.6)" }}>
        Your brain is already changing. Keep the momentum going.
      </p>
      <div className="mt-5" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        {/* Monthly */}
         <div className="p-4 bg-transparent" style={{ border: "1px solid #c5d3e8", borderRadius: 12 }}>
           <p className="text-[11px] uppercase tracking-wider text-rs-navy" style={{ color: "#7B9BD6" }}>Monthly</p>
          <p className="mt-1">
            <span className="text-[26px] font-bold" style={{ color: "#1A2A4A" }}>₹21</span>
            <span className="text-[12px] text-black/50 ml-1">/first month</span>
          </p>
          <p className="text-[11px] text-black/50">then ₹199/mo</p>
          <p className="text-[11px] text-black/50">Less than ₹7 a day</p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-3 py-2 text-white font-semibold"
            style={{ background: "#7B9BD6", borderRadius: 8 }}
          >
            {loading ? "Opening…" : "Start →"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoadmapStrip = ({ currentDay }: { currentDay: number }) => {
  const phases = [
    {
      label: "Phase 1 · Days 1–7",
      title: "Prove it works",
      status: currentDay <= 7 ? "✓ In progress" : "✓ Complete",
      active: true,
    },
    { label: "Phase 2 · Days 8–14", title: "Deepen the experience", status: "🔒 Locked", active: false },
    { label: "Phase 3 · Days 15–21", title: "Feel the stakes", status: "🔒 Locked", active: false },
  ];
  return (
    <div className="mt-4 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {phases.map((p) => (
          <div
            key={p.label}
            className="flex-shrink-0 px-3 py-2 min-w-[140px]"
            style={{
              background: p.active ? "rgba(245,240,160,0.15)" : "rgba(255,255,255,0.4)",
              border: p.active ? "1px solid #F5F0A0" : "1px solid #c5d3e8",
              borderRadius: 12,
            }}
          >
            <p className="text-[12px] font-bold" style={{ color: "#1A2A4A" }}>{p.label}</p>
            <p className="text-[11px] text-black/50">{p.title}</p>
            <p className={`text-[11px] mt-1 ${p.active ? "text-[hsl(var(--rs-green))] font-semibold" : "text-black/50"}`}>
              {p.status}
            </p>
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] italic mt-2" style={{ color: "rgba(26,42,74,0.5)" }}>
        Unlock all 21 days + your full Reset Report on Day 21
      </p>
    </div>
  );
};

const PhaseHeader = ({ n, title, accent }: { n: number; title: string; accent: string }) => (
  <div className="mt-6 mb-3">
    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: accent }}>Phase {n}</p>
    <p className="text-white text-[18px] font-bold">{title}</p>
  </div>
);

const JourneyScreen = () => {
  const { profile } = useProfile();
  const { isActive } = useSubscription();
  const day = profile?.current_day ?? 1;
  const [open, setOpen] = useState<number | null>(day);
  const [checks, setChecks] = useState<Record<number, Record<string, boolean>>>({});

  // Sync current day to localStorage so Mandala can read phase
  useEffect(() => {
    try { localStorage.setItem("restart_day", String(day)); } catch {}
  }, [day]);

  const requiredLabelsFor = (d: DayPlan): string[] => {
    const base = ["Morning Anchor", "Neuro", "Ayurveda", "Evening Wind-Down"];
    if (d.midday) base.push("Midday Reset");
    if (d.focusWindow) base.push("Focus Window");
    if (d.community) base.push("Community");
    return base;
  };

  const findDayPlan = (n: number): DayPlan | undefined =>
    [...PHASE_1, ...PHASE_2, ...PHASE_3].find((p) => p.day === n);

  const handleCheck = (dayNum: number, label: string, value: boolean) => {
    setChecks((prev) => {
      const next = { ...prev, [dayNum]: { ...(prev[dayNum] ?? {}), [label]: value } };
      const plan = findDayPlan(dayNum);
      if (plan) {
        const required = requiredLabelsFor(plan);
        const allDone = required.every((l) => next[dayNum][l]);
        if (allDone) {
          try {
            const raw = localStorage.getItem("restart_completed_days");
            const arr: number[] = raw ? JSON.parse(raw) : [];
            if (Array.isArray(arr) && !arr.includes(dayNum)) {
              arr.push(dayNum);
              localStorage.setItem("restart_completed_days", JSON.stringify(arr));
            }
          } catch {}
        }
      }
      return next;
    });
  };

  const dayStatus = (n: number): "done" | "active" | "locked" => {
    // Days 4–21 are locked for non-Pro users
    if (!isActive && n > 3) return "locked";
    if (n < day) return "done";
    if (n === day) return "active";
    return "locked";
  };

  const showPaywall = !isActive;
  const phase1FirstThree = PHASE_1.slice(0, 3);
  const phase1Rest = PHASE_1.slice(3);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="phone-frame min-h-screen pb-28 px-5 pt-10" style={{ paddingTop: 54 }}>
      <TopBar />
      <h1 className="text-[24px] font-bold text-white">Your 21-day journey</h1>
      <p className="text-rs-muted text-[13px] mt-1">Day {day} of 21 — keep showing up.</p>

      <PhaseHeader n={1} title="Prove it works" accent="hsl(var(--rs-cream))" />
      <div className="space-y-2.5">
        {phase1FirstThree.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="hsl(var(--rs-cream))"
            checks={checks[d.day] ?? {}} onCheck={(l, v) => handleCheck(d.day, l, v)} />
        ))}
      </div>

      {showPaywall && <PaywallGate />}
      {showPaywall && <RoadmapStrip currentDay={day} />}

      <div className="space-y-2.5">
        {phase1Rest.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="hsl(var(--rs-cream))"
            checks={checks[d.day] ?? {}} onCheck={(l, v) => handleCheck(d.day, l, v)} />
        ))}
      </div>

      <PhaseHeader n={2} title="Deepen the experience" accent="#B8CCE8" />
      <div className="space-y-2.5">
        {PHASE_2.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="#B8CCE8"
            checks={checks[d.day] ?? {}} onCheck={(l, v) => handleCheck(d.day, l, v)} />
        ))}
      </div>

      <PhaseHeader n={3} title="Feel the stakes" accent="#7B9BD6" />
      <div className="space-y-2.5">
        {PHASE_3.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="#7B9BD6"
            checks={checks[d.day] ?? {}} onCheck={(l, v) => handleCheck(d.day, l, v)} />
        ))}
      </div>

      <BottomNav />
    </motion.div>
  );
};
export default JourneyScreen;
