import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Lock, Brain } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";
import { useSubscription } from "@/hooks/useSubscription";
import { getPracticesForState } from "@/lib/getPracticesForState";
import { useAuth } from "@/hooks/useAuth";
import { initiateRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";
import MandalaComplete from "@/components/MandalaComplete";
import { supabase } from "@/integrations/supabase/client";

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
  const completed = status === "done";
  return (
    <div
      className={`rounded-2xl border overflow-hidden relative ${
        status === "active" ? "border-rs-cream bg-white/15" : "border-white/20 bg-white/8"
      }`}
      style={
        completed
          ? { background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.2)" }
          : undefined
      }
    >
      {completed && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            fontSize: 10,
            background: "#E1F5EE",
            color: "#085041",
            padding: "2px 8px",
            borderRadius: 20,
            zIndex: 1,
          }}
        >
          Completed
        </span>
      )}
      <button onClick={locked ? undefined : onToggle}
        className="w-full flex items-center gap-3 p-4 text-left btn-press disabled:cursor-not-allowed"
        disabled={locked}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
          style={{ background: status === "done" ? "#1D9E75" : status === "active" ? accent : "rgba(255,255,255,0.15)", color: status === "active" ? "hsl(var(--rs-navy))" : "white" }}>
          {status === "done" ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5 text-rs-navy" /> : d.day}
        </div>
        <div className="flex-1">
          <p className="text-white text-[14px] font-semibold">Day {d.day}</p>
          <p className="text-rs-muted text-[12px]">{locked ? (d.day > 3 ? "Unlock with Pro" : "Unlocks soon") : d.morning}</p>
        </div>
        {!locked && (expanded ? <ChevronUp className="w-4 h-4 text-rs-navy" /> : <ChevronDown className="w-4 h-4 text-rs-navy" />)}
      </button>
      {expanded && !locked && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 space-y-2"
          style={completed ? { opacity: 0.7 } : undefined}>
          <Task label="Morning Anchor" body={d.morning} checked={completed || !!checks["Morning Anchor"]} onChange={(v) => onCheck("Morning Anchor", v)} disabled={completed} />
          {(() => {
            const state = (typeof window !== "undefined" && localStorage.getItem("restart_checkin_state")) || "default";
            const triad = getPracticesForState(state);
            return (
              <div className="mt-2 space-y-1.5">
                <TriadRow icon="🧠" label="NEUROSCIENCE" name={triad.neuro.name} duration={triad.neuro.duration} />
                <TriadRow icon="🌿" label="AYURVEDA" name={triad.ayurveda.name} duration={triad.ayurveda.duration} />
                <TriadRow icon="💨" label="BREATHWORK" name={triad.breathwork.name} duration={triad.breathwork.duration} />
              </div>
            );
          })()}
          {d.midday && <Task label="Midday Reset" body={d.midday} checked={completed || !!checks["Midday Reset"]} onChange={(v) => onCheck("Midday Reset", v)} disabled={completed} />}
          {d.focusWindow && <Task label="Focus Window" body={d.focusWindow} checked={completed || !!checks["Focus Window"]} onChange={(v) => onCheck("Focus Window", v)} disabled={completed} />}
          {d.community && <Task label="Community" body={d.community} checked={completed || !!checks["Community"]} onChange={(v) => onCheck("Community", v)} disabled={completed} />}
          <Task label="Evening Wind-Down" body={d.evening} checked={completed || !!checks["Evening Wind-Down"]} onChange={(v) => onCheck("Evening Wind-Down", v)} disabled={completed} />
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

const Task = ({ label, body, checked, onChange, disabled }: { label: string; body: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <div className="flex items-start gap-3 py-2">
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-[hsl(var(--rs-cream))]" />
    <div className="flex-1">
      <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">{label}</p>
      <p className="text-white text-[13px]">{body}</p>
    </div>
  </div>
);

const TriadRow = ({ icon, label, name, duration }: { icon: string; label: string; name: string; duration: string }) => (
  <div className="flex items-center gap-3 py-1.5 px-2 rounded-lg bg-white/5 cursor-pointer btn-press" onClick={() => { window.location.href = "/practices"; }}>
    <span className="text-base">{icon}</span>
    <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold w-24 flex-shrink-0">{label}</p>
    <p className="text-white text-[13px] flex-1">{name} — <span className="text-rs-navy">{duration}</span></p>
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
    <>
    <div
      className="mb-3 flex items-start gap-2"
      style={{
        background: "rgba(245,240,160,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-text-secondary, rgba(26,42,74,0.7))" }} />
      <p
        className="italic"
        style={{ fontSize: 12, color: "var(--color-text-secondary, rgba(26,42,74,0.7))" }}
      >
        Neuroscience fact: it takes 18–66 days to form a new habit. Day 3 is when most people quit. You didn't.
      </p>
    </div>
    <div
      className="my-4 rounded-2xl p-6"
      style={{
        border: "1.5px solid #F5F0A0",
        background: "rgba(245,240,160,0.08)",
        borderRadius: 16,
      }}
    >
      <div className="flex justify-center"><Lock className="w-7 h-7 text-rs-navy" /></div>
      <p className="text-center font-bold text-[18px] mt-3" style={{ color: "#1A2A4A" }}>
        It takes 21 days to build a habit.
      </p>
      <p className="text-center text-[13px] mt-1" style={{ color: "rgba(26,42,74,0.6)" }}>
        You've done 3. The hardest part is over. Don't stop now.
      </p>
      <p className="text-center text-[12px] italic mt-2" style={{ color: "rgba(26,42,74,0.6)" }}>
        ₹21 for the full 21-day reset — less than a chai a day.
      </p>
      <div className="mt-5" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        {/* Monthly */}
         <div className="p-4 bg-transparent" style={{ border: "1px solid #c5d3e8", borderRadius: 12 }}>
           <p className="text-[11px] uppercase tracking-wider text-rs-navy" style={{ color: "#7B9BD6" }}>21-Day Reset</p>
          <p className="mt-1">
            <span className="text-[26px] font-bold" style={{ color: "#1A2A4A" }}>₹21</span>
            <span className="text-[12px] text-black/50 ml-1">for days 4–21</span>
          </p>
          <p className="text-[11px] text-black/50">Then ₹199/mo to maintain your habit</p>
          <p className="text-[11px] text-black/50">Then ₹199/mo from month 2.</p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-3 py-2 text-white font-semibold"
            style={{ background: "#7B9BD6", borderRadius: 8 }}
          >
            {loading ? "Opening…" : "Continue my reset →"}
          </button>
          {typeof import.meta.env.VITE_RAZORPAY_KEY_ID === "string" &&
            import.meta.env.VITE_RAZORPAY_KEY_ID.includes("test") && (
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("restart_pro", "true");
                    localStorage.setItem("restart_payment_id", "test_simulation");
                  } catch {}
                  window.location.href = "/journey";
                }}
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "block",
                  textAlign: "center",
                  marginTop: 8,
                  width: "100%",
                }}
              >
                [Dev] Simulate payment success
              </button>
            )}
          {typeof import.meta.env.VITE_RAZORPAY_KEY_ID === "string" &&
            import.meta.env.VITE_RAZORPAY_KEY_ID?.includes("test") === true && (
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("restart_pro", "true");
                    localStorage.setItem("restart_payment_id", "test_skip");
                  } catch {}
                  window.location.reload();
                }}
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "block",
                  textAlign: "center",
                  marginTop: 8,
                  width: "100%",
                }}
              >
                Skip payment (test mode)
              </button>
            )}
        </div>
      </div>
    </div>
    </>
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
    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-rs-navy" style={{ color: accent }}>Phase {n}</p>
    <p className="text-white text-[18px] font-bold">{title}</p>
  </div>
);

const JourneyScreen = () => {
  const { profile } = useProfile();
  const { isActive } = useSubscription();
  const day = profile?.current_day ?? 1;
  const [open, setOpen] = useState<number | null>(day);
  const [checks, setChecks] = useState<Record<number, Record<string, boolean>>>({});
  const [completedDay, setCompletedDay] = useState<number | null>(null);
  const [localPro, setLocalPro] = useState<boolean>(() => {
    try { return localStorage.getItem("restart_pro") === "true"; } catch { return false; }
  });
  const simDay = (() => {
    try { return parseInt(localStorage.getItem("restart_day") || String(day)); } catch { return day; }
  })();
  const completedDaysLs: number[] = (() => {
    try {
      const raw = localStorage.getItem("restart_completed_days");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  })();
  const showDay3Celebration =
    simDay === 3 && [1, 2, 3].every((d) => completedDaysLs.includes(d));

  useEffect(() => {
    const onStorage = () => {
      try { setLocalPro(localStorage.getItem("restart_pro") === "true"); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isPro = isActive || localPro;

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
              setCompletedDay(dayNum);
            }
          } catch {}
        }
      }
      return next;
    });
  };

  const handleMandalaDismiss = async () => {
    const dayNum = completedDay;
    setCompletedDay(null);
    if (!dayNum) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = localStorage.getItem("restart_didi_last_date");
      const cur = Number(localStorage.getItem("restart_didi_streak") || 0);
      let next = 1;
      if (last) {
        const diff = Math.round((new Date(today).getTime() - new Date(last).getTime()) / 86400000);
        if (diff === 0) next = cur || 1;
        else if (diff === 1) next = cur + 1;
      }
      localStorage.setItem("restart_didi_streak", String(next));
      localStorage.setItem("restart_didi_last_date", today);
    } catch {}
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_journey_progress").upsert({ user_id: user.id, day: dayNum }, { onConflict: "user_id,day" });
      const { data: prof } = await supabase.from("profiles").select("didi_xp").eq("id", user.id).maybeSingle();
      const newXP = (prof?.didi_xp ?? 0) + 25;
      await supabase.from("profiles").update({ didi_xp: newXP }).eq("id", user.id);
      try { localStorage.setItem("restart_didi_xp", String(newXP)); } catch {}
    }
  };

  const dayStatus = (n: number): "done" | "active" | "locked" => {
    // Days 4–21 are locked for non-Pro users
    if (!isPro && n > 3) return "locked";
    if (completedDaysLs.includes(n)) return "done";
    if (n < day) return "done";
    if (n === day) return "active";
    return "locked";
  };

  const showPaywall = !isPro;
  const phase1FirstThree = PHASE_1.slice(0, 3);
  const phase1Rest = PHASE_1.slice(3);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="phone-frame min-h-screen pb-28 px-5 pt-10" style={{ paddingTop: 54 }}>
      <TopBar />
      {showDay3Celebration && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(245,240,160,0.3), rgba(123,155,214,0.2))",
            border: "1px solid rgba(245,240,160,0.5)",
            borderRadius: 16,
            padding: "16px 20px",
            margin: "16px 0 8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A2A4A" }}>3 days done.</div>
          <div style={{ fontSize: 13, color: "rgba(26,42,74,0.65)", marginTop: 4 }}>
            Your brain has already started changing.
          </div>
          <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(26,42,74,0.5)", marginTop: 4 }}>
            Most people quit at day 3. You didn't.
          </div>
        </div>
      )}
      <h1 className="text-[24px] font-bold text-white">Your 21-day journey</h1>
      <p className="text-rs-muted text-[13px] mt-1">Day {day} of 21 — keep showing up.</p>

      {showDay3Celebration && !isPro && (
        <>
          <p className="text-white text-[15px] font-semibold mt-4">
            Keep going — Days 4–21 are waiting.
          </p>
          <PaywallGate />
        </>
      )}

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
      {completedDay && (
        <MandalaComplete
          dayNumber={completedDay}
          firstName={(profile?.name || "").split(" ")[0] || "friend"}
          xpEarned={25}
          onDismiss={handleMandalaDismiss}
        />
      )}
      {import.meta.env.VITE_RAZORPAY_KEY_ID?.includes("test") && (
        <DevDayPanel simDay={simDay} />
      )}
    </motion.div>
  );
};
export default JourneyScreen;

const DevDayPanel = ({ simDay }: { simDay: number }) => {
  const setDay1 = () => {
    localStorage.setItem("restart_day", "1");
    localStorage.setItem("restart_completed_days", JSON.stringify([]));
    localStorage.setItem("restart_pro", "false");
    window.location.reload();
  };
  const setDay3 = () => {
    localStorage.setItem("restart_day", "3");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3]));
    localStorage.setItem("restart_streak", "3");
    localStorage.setItem("restart_pro", "false");
    window.location.reload();
  };
  const setDay4 = () => {
    localStorage.setItem("restart_day", "4");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3]));
    localStorage.setItem("restart_streak", "3");
    localStorage.setItem("restart_pro", "false");
    window.location.reload();
  };
  const fullReset = () => {
    const keys = [
      "restart_day", "restart_completed_days",
      "restart_streak", "restart_pro",
      "restart_checkin_state", "restart_checkin_date",
      "restart_checkin_emotion", "restart_consent_signed",
      "restart_consent_signature", "restart_consent_date",
      "restart_chronotype", "restart_name",
      "restart_age", "restart_role", "restart_path",
      "restart_sleep", "restart_lifestyle",
      "restart_openness", "restart_whatsapp_asked",
      "restart_launched",
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.href = "/onboarding";
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
        zIndex: 999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
        Dev: Simulate days
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <button style={simDay === 1 ? activeBtn : baseBtn} onClick={setDay1}>Day 1</button>
        <button style={simDay === 3 ? activeBtn : baseBtn} onClick={setDay3}>Day 3 ✓</button>
        <button style={simDay >= 4 ? activeBtn : baseBtn} onClick={setDay4}>Day 4+</button>
        <button style={baseBtn} onClick={fullReset}>↺ Full Reset</button>
      </div>
    </div>
  );
};
