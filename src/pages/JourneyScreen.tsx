import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

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

const DayRow = ({ d, status, expanded, onToggle, accent }: {
  d: DayPlan; status: "locked" | "active" | "done"; expanded: boolean;
  onToggle: () => void; accent: string;
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
          <p className="text-rs-muted text-[12px]">{locked ? "Unlocks soon" : d.morning}</p>
        </div>
        {!locked && (expanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />)}
      </button>
      {expanded && !locked && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 space-y-2">
          <Task label="Morning Anchor" body={d.morning} />
          <Task label="Neuro" body={d.neuro} />
          <Task label="Ayurveda" body={d.ayurveda} />
          {d.midday && <Task label="Midday Reset" body={d.midday} />}
          {d.focusWindow && <Task label="Focus Window" body={d.focusWindow} />}
          {d.community && <Task label="Community" body={d.community} />}
          <Task label="Evening Wind-Down" body={d.evening} />
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

const Task = ({ label, body }: { label: string; body: string }) => (
  <div className="flex items-start gap-3 py-2">
    <input type="checkbox" className="mt-1 accent-[hsl(var(--rs-cream))]" />
    <div className="flex-1">
      <p className="text-[10px] tracking-[0.16em] uppercase text-rs-cream font-semibold">{label}</p>
      <p className="text-white text-[13px]">{body}</p>
    </div>
  </div>
);

const PhaseHeader = ({ n, title, accent }: { n: number; title: string; accent: string }) => (
  <div className="mt-6 mb-3">
    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: accent }}>Phase {n}</p>
    <p className="text-white text-[18px] font-bold">{title}</p>
  </div>
);

const JourneyScreen = () => {
  const { profile } = useProfile();
  const day = profile?.current_day ?? 1;
  const [open, setOpen] = useState<number | null>(day);

  const dayStatus = (n: number): "done" | "active" | "locked" =>
    n < day ? "done" : n === day ? "active" : "locked";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="phone-frame min-h-screen pb-28 px-5 pt-10" style={{ paddingTop: 54 }}>
      <TopBar />
      <h1 className="text-[24px] font-bold text-white">Your 21-day journey</h1>
      <p className="text-rs-muted text-[13px] mt-1">Day {day} of 21 — keep showing up.</p>

      <PhaseHeader n={1} title="Prove it works" accent="hsl(var(--rs-cream))" />
      <div className="space-y-2.5">
        {PHASE_1.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="hsl(var(--rs-cream))" />
        ))}
      </div>

      <PhaseHeader n={2} title="Deepen the experience" accent="#B8CCE8" />
      <div className="space-y-2.5">
        {PHASE_2.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="#B8CCE8" />
        ))}
      </div>

      <PhaseHeader n={3} title="Feel the stakes" accent="#7B9BD6" />
      <div className="space-y-2.5">
        {PHASE_3.map((d) => (
          <DayRow key={d.day} d={d} status={dayStatus(d.day)} expanded={open === d.day}
            onToggle={() => setOpen(open === d.day ? null : d.day)} accent="#7B9BD6" />
        ))}
      </div>

      <BottomNav />
    </motion.div>
  );
};
export default JourneyScreen;
