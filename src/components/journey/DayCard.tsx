import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Lock, Crown, ArrowRight, Play } from "lucide-react";
import type { Practice, Dosha } from "@/data/practices";
import {
  getDayState,
  setDayState,
  markDayOpened,
  bothTasksDone,
  msUntilNextUnlock,
  isNextDayUnlocked,
  formatCountdown,
  getPracticesForDay,
  TOTAL_DAYS,
  type DayPractices,
} from "@/lib/dayProgression";
import {
  formatPeakWindow,
  getCurrentWindow,
  bannerCopy,
  getTimingMismatchNote,
} from "@/lib/chronotype";
import DidiGuidance from "@/components/journey/DidiGuidance";

interface DayCardProps {
  day: number;
  currentDay: number;
  completedDays: number[];
  dosha: Dosha | null | undefined;
  chronotype: string | null | undefined;
  userName: string;
  isPro: boolean;
  onClose: () => void;
  onAdvance: () => void;       // user tapped "Continue to Day N+1"
  onUpgrade: () => void;       // user tapped paywall CTA
}

const sectionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 16,
};

const BUTTER = "#fdfcb8";
const DAY_THEME: Record<number, string> = {
  1: "Regulate",
  2: "Reframe",
  3: "Restart",
};
const DAY_QUOTE: Record<number, string> = {
  1: "You showed up. That's already the hardest part done.",
  2: "Something shifted yesterday. Today it goes deeper.",
  3: "Three days. Real change. This is just where it begins.",
};

const PracticeBlock = ({
  icon,
  label,
  practice,
  done,
  timingNote,
  onStart,
  onMarkDone,
}: {
  icon: string;
  label: string;
  practice: Practice;
  done: boolean;
  timingNote: string | null;
  onStart: () => void;
  onMarkDone: () => void;
}) => (
  <div style={sectionStyle}>
    <p className="text-[10px] tracking-[0.2em] uppercase font-semibold"
       style={{ color: "rgba(245,225,160,0.85)" }}>
      {icon} {label}
    </p>
    <h4 className="text-[17px] font-semibold mt-1.5 leading-tight" style={{ color: BUTTER }}>
      {practice.name}
    </h4>
    <p className="text-[11px] mt-1" style={{ color: "#ffffff" }}>
      {practice.duration} · {practice.appFlow.split(".")[0]}.
    </p>
    {timingNote && (
      <p className="text-[11px] mt-2 italic" style={{ color: "#ffffff" }}>
        ⏱ {timingNote}
      </p>
    )}
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        onClick={onStart}
        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl btn-press"
        style={{
          background: "rgba(255,255,255,0.10)",
          color: BUTTER,
          border: "1px solid rgba(255,255,255,0.18)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <Play className="w-3.5 h-3.5" /> Start
      </button>
      <button
        type="button"
        onClick={onMarkDone}
        disabled={done}
        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl btn-press"
        style={{
          background: done ? "rgba(29,158,117,0.25)" : "#F5E1A0",
          color: done ? "#A7F0CE" : "#1A2A4A",
          border: done ? "1px solid rgba(29,158,117,0.5)" : "1px solid #F5E1A0",
          fontSize: 13,
          fontWeight: 700,
          opacity: done ? 0.9 : 1,
        }}
      >
        <Check className="w-3.5 h-3.5" />
        {done ? "Done" : "Mark done"}
      </button>
    </div>
  </div>
);

const DayCard = ({
  day,
  currentDay,
  completedDays,
  dosha,
  chronotype,
  userName,
  isPro,
  onClose,
  onAdvance,
  onUpgrade,
}: DayCardProps) => {
  const nav = useNavigate();
  const [state, setState] = useState(() => getDayState(day));
  const [now, setNow] = useState(Date.now());
  const [paywall, setPaywall] = useState(false);
  const [didiPractice, setDidiPractice] = useState<Practice | null>(null);

  // Mark this day as opened on first mount; refresh state ref.
  useEffect(() => {
    setState(markDayOpened(day));
  }, [day]);

  // Live countdown — tick every minute.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const practices: DayPractices = useMemo(
    () => getPracticesForDay(dosha ?? null, day),
    [dosha, day],
  );

  const update = (patch: Partial<typeof state>) => setState(setDayState(day, patch));

  const tasksDone = bothTasksDone(state);
  const msLeft = msUntilNextUnlock(state);
  const unlocked = isNextDayUnlocked(state);
  const isLastDay = day >= TOTAL_DAYS;

  // Pills always show all 3 days of the reset.
  const pillDays = useMemo(() => [1, 2, 3].filter((d) => d <= TOTAL_DAYS), []);

  const handleStart = (_label: string, p: Practice) => {
    setDidiPractice(p);
  };

  const windowState = getCurrentWindow(chronotype);
  const inPeak = windowState === "peak";
  const banner = bannerCopy(windowState, userName?.trim() || "you");
  const peakLine = formatPeakWindow(chronotype);
  const neuroTimingNote = getTimingMismatchNote(practices.neuro.id, chronotype);
  const ayurTimingNote = getTimingMismatchNote(practices.ayurveda.id, chronotype);

  const handleAdvance = () => {
    if (isLastDay) {
      nav("/completion");
      return;
    }
    onAdvance();
  };

  // Subtitle of next button
  let nextButtonLabel = `Continue to Day ${day + 1} →`;
  let nextDisabled = false;
  let nextStyle: React.CSSProperties = { background: "#F5E1A0", color: "#1A2A4A" };
  if (isLastDay && tasksDone) {
    nextButtonLabel = "See your reset →";
    nextDisabled = false;
    nextStyle = { background: "#F5E1A0", color: "#1A2A4A" };
  } else if (!tasksDone) {
    nextButtonLabel = "Complete both practices first";
    nextDisabled = true;
    nextStyle = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" };
  } else if (!unlocked) {
    nextButtonLabel = `Day ${day + 1} unlocks in ${formatCountdown(msLeft)}`;
    nextDisabled = true;
    nextStyle = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" };
  }

  // Quick tick to keep `unlocked` in sync with `now` (in case state already done).
  void now;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 240 }}
      className="fixed left-0 right-0 bottom-0 z-50"
    >
      <div className="phone-frame !min-h-0 px-4 pb-24">
        <div
          className="rounded-t-3xl p-5 relative"
          style={{
            background: "rgba(15,12,40,0.94)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
            maxHeight: "82vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase font-bold"
                 style={{ color: "rgba(245,225,160,0.85)" }}>
                Day {day} of {TOTAL_DAYS}
              </p>
              <h3 className="text-[22px] font-bold mt-1 leading-tight" style={{ color: BUTTER }}>
                {DAY_THEME[day] ?? "Restart"}
              </h3>
              {inPeak ? (
                <p className="text-[11px] mt-1.5 font-semibold" style={{ color: BUTTER }}>
                  ✦ You're in your peak window right now
                </p>
              ) : (
                <p className="text-[11px] mt-1.5" style={{ color: "#ffffff" }}>
                  ⏱ Best time for your practices: {peakLine}
                </p>
              )}
              {practices.isDefaultMood && (
                <p className="text-[11px] mt-1" style={{ color: "#ffffff" }}>
                  No check-in today — using your baseline.
                </p>
              )}
            </div>

            {/* Day pills (top-right tracker) */}
            <div className="flex flex-col items-end gap-2">
              <button onClick={onClose} className="p-1.5 rounded-full btn-press"
                style={{ background: "rgba(255,255,255,0.08)" }} aria-label="Close">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <div className="flex gap-1">
                {pillDays.map((d) => {
                  const isCurrent = d === day;
                  const isDone = completedDays.includes(d);
                  const isLocked = d > currentDay;
                  return (
                    <span
                      key={d}
                      className="px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1"
                      style={{
                        background: isCurrent
                          ? "#F5E1A0"
                          : isDone
                          ? "rgba(29,158,117,0.25)"
                          : "rgba(255,255,255,0.06)",
                        color: isCurrent ? "#1A2A4A" : isDone ? "#A7F0CE" : "rgba(255,255,255,0.4)",
                        border: isCurrent ? "1px solid #F5E1A0" : "1px solid transparent",
                      }}
                    >
                      {isDone && <Check className="w-2.5 h-2.5" />}
                      {isLocked && <Lock className="w-2.5 h-2.5" />}
                      D{d}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div
            className="mt-5 space-y-3"
            style={paywall ? { filter: "blur(6px)", pointerEvents: "none" } : undefined}
          >
            {/* Daily motivational quote */}
            <div
              className="rounded-xl px-3 py-3"
              style={{
                background: "rgba(245,225,160,0.10)",
                border: "1px solid rgba(245,225,160,0.30)",
              }}
            >
              <p className="text-[13px] italic leading-snug" style={{ color: BUTTER }}>
                "{DAY_QUOTE[day] ?? DAY_QUOTE[3]}"
              </p>
            </div>
            {banner && (
              <div
                className="rounded-xl px-3 py-2.5"
                style={{
                  background: windowState === "peak"
                    ? "rgba(245,225,160,0.14)"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${windowState === "peak"
                    ? "rgba(245,225,160,0.4)"
                    : "rgba(255,255,255,0.10)"}`,
                }}
              >
                <p className="text-[12px]" style={{
                  color: windowState === "peak" ? BUTTER : "#ffffff",
                }}>
                  {banner}
                </p>
              </div>
            )}
            <PracticeBlock
              icon="🧠"
              label="Neuroscience"
              practice={practices.neuro}
              done={state.neuroDone}
              timingNote={neuroTimingNote}
              onStart={() => handleStart("Neuroscience", practices.neuro)}
              onMarkDone={() => update({ neuroDone: true })}
            />
            <PracticeBlock
              icon="🌿"
              label="Ayurveda"
              practice={practices.ayurveda}
              done={state.ayurvedaDone}
              timingNote={ayurTimingNote}
              onStart={() => handleStart("Ayurveda", practices.ayurveda)}
              onMarkDone={() => update({ ayurvedaDone: true })}
            />

            {/* Next-day button */}
            <button
              type="button"
              onClick={handleAdvance}
              disabled={nextDisabled}
              className="mt-2 w-full py-3.5 rounded-xl font-bold btn-press flex items-center justify-center gap-2"
              style={{
                ...nextStyle,
                // Lock-bar text (disabled state) → butter yellow per spec.
                color: nextDisabled
                  ? BUTTER
                  : (nextStyle.color as string | undefined) ?? "#1A2A4A",
                fontSize: 14,
                cursor: nextDisabled ? "not-allowed" : "pointer",
              }}
            >
              {nextDisabled && !tasksDone && <Lock className="w-3.5 h-3.5" />}
              {nextDisabled && tasksDone && !unlocked && <Lock className="w-3.5 h-3.5" />}
              {nextButtonLabel}
              {!nextDisabled && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Paywall overlay (Day 4+ intercept) */}
          {paywall && (
            <div className="absolute inset-0 flex items-center justify-center px-6 z-10">
              <div
                className="w-full rounded-3xl p-6 text-center"
                style={{
                  background: "rgba(20,15,55,0.96)",
                  border: "1px solid rgba(245,225,160,0.45)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                }}
              >
                <Crown className="w-8 h-8 mx-auto" style={{ color: "#F5E1A0" }} />
                <p className="text-white text-[18px] font-bold mt-3 leading-tight">
                  You've rewired 3 days in a row.
                </p>
                <p className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Day {day + 1} is where the real shift begins.
                </p>
                <button
                  onClick={onUpgrade}
                  className="mt-5 w-full py-3 rounded-xl font-bold btn-press"
                  style={{ background: "#F5E1A0", color: "#1A2A4A", fontSize: 14 }}
                >
                  Start Free Trial
                </button>
                <button
                  onClick={onUpgrade}
                  className="mt-2 w-full py-3 rounded-xl font-semibold btn-press"
                  style={{ background: "rgba(255,255,255,0.08)", color: "white", fontSize: 13 }}
                >
                  See Plans →
                </button>
                <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                  ₹21/day. Cancel anytime.
                </p>
                <button
                  onClick={() => setPaywall(false)}
                  className="mt-2 text-[11px] underline"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Not now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DidiGuidance
        practice={didiPractice}
        open={!!didiPractice}
        userName={userName}
        onClose={() => setDidiPractice(null)}
      />
    </motion.div>
  );
};

export default DayCard;