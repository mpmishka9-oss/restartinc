import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { getBaselinePractices } from "@/lib/recommendPractices";
import { getWhyTodayLabel } from "@/lib/getPracticesForState";
import PracticeCard from "@/components/PracticeCard";
import BottomNav from "@/components/layout/BottomNav";
import DayCard from "@/components/journey/DayCard";
import {
  advanceToNextDay,
  getCompletedDays,
  getCurrentDay,
} from "@/lib/dayProgression";

/* ──────────────────────────────────────────────────────────────
   "Your Ascent" — milestone-based mountain journey
   ────────────────────────────────────────────────────────────── */

type MilestoneId = "m1" | "m2" | "m3";

interface Milestone {
  id: MilestoneId;
  title: string;
  sublabel: string;
  dayStart: number;
  dayEnd: number;        // inclusive; peak uses 21
  // SVG coordinates inside a 400x820 viewBox
  x: number;
  y: number;
  // anchor side of the label relative to node
  side: "left" | "right" | "center";
  // free tier? days <= 3 are free; everything else needs Pro
  requiresPro: boolean;
}

const MILESTONES: Milestone[] = [
  { id: "m1", title: "Regulate", sublabel: "Calm the nervous system",    dayStart: 1, dayEnd: 1, x: 90,  y: 460, side: "right", requiresPro: false },
  { id: "m2", title: "Reframe",  sublabel: "Shift the story",            dayStart: 2, dayEnd: 2, x: 300, y: 270, side: "left",  requiresPro: false },
  { id: "m3", title: "Restart",  sublabel: "This is just the beginning", dayStart: 3, dayEnd: 3, x: 110, y: 90,  side: "right", requiresPro: false },
];

/* The winding path expressed as a single SVG <path d="…"/> – passes through every milestone. */
const PATH_D =
  "M 90 460 " +
  "C 220 460, 350 380, 300 270 " +
  "C 250 170, 60 200, 110 90";

/* ── Background mountain illustration ─────────────────────────── */
const MountainBackdrop = () => (
  <svg
    viewBox="0 0 400 820"
    preserveAspectRatio="xMidYMid slice"
    className="absolute inset-0 w-full h-full"
    aria-hidden
  >
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%"  stopColor="#FFFFFF" />
        <stop offset="18%" stopColor="#E6F0FA" />
        <stop offset="48%" stopColor="#7FA9DC" />
        <stop offset="100%" stopColor="#2D1B69" />
      </linearGradient>
      <radialGradient id="peakGlow" cx="50%" cy="10%" r="35%">
        <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="mtnFar" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%"  stopColor="#9FBEE0" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#3A2C7B" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="mtnNear" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%"  stopColor="#6E8FBE" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#1F1450" stopOpacity="0.95" />
      </linearGradient>
    </defs>

    {/* sky */}
    <rect x="0" y="0" width="400" height="820" fill="url(#sky)" />
    {/* peak halo */}
    <rect x="0" y="0" width="400" height="400" fill="url(#peakGlow)" />

    {/* far mountain ridge */}
    <path
      d="M 0 360 L 80 280 L 140 320 L 200 200 L 260 290 L 330 240 L 400 320 L 400 820 L 0 820 Z"
      fill="url(#mtnFar)"
    />
    {/* near mountain silhouette behind path */}
    <path
      d="M 0 520 L 60 460 L 130 500 L 200 380 L 270 470 L 340 430 L 400 500 L 400 820 L 0 820 Z"
      fill="url(#mtnNear)"
    />
  </svg>
);

/* ── Helper: classify a milestone’s status ────────────────────── */
function milestoneStatus(m: Milestone, currentDay: number): "done" | "current" | "upcoming" {
  if (currentDay > m.dayEnd) return "done";
  if (currentDay >= m.dayStart && currentDay <= m.dayEnd) return "current";
  return "upcoming";
}

/* ── Initials fallback for the avatar circle ──────────────────── */
function initialsFor(name?: string | null): string {
  if (!name) return "🧘";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

/* ── Expanded card for a tapped milestone ─────────────────────── */
const MilestoneSheet = ({
  milestone,
  currentDay,
  completedDays,
  isPro,
  onClose,
  onUpgrade,
}: {
  milestone: Milestone;
  currentDay: number;
  completedDays: number[];
  isPro: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) => {
  const { profile } = useProfile();
  const dosha = (profile as any)?.dosha ?? null;
  const locked = milestone.requiresPro && !isPro;
  const days = Array.from(
    { length: milestone.dayEnd - milestone.dayStart + 1 },
    (_, i) => milestone.dayStart + i,
  );
  const [openDay, setOpenDay] = useState<number | null>(
    days.includes(currentDay) ? currentDay : days[0],
  );
  const why = getWhyTodayLabel(openDay ?? currentDay);
  const { neuro, ayurveda } = getBaselinePractices(dosha, openDay ?? currentDay);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 240 }}
      className="fixed left-0 right-0 bottom-0 z-50"
    >
      <div className="phone-frame !min-h-0 px-5 pb-24">
        <div
          className="rounded-t-3xl p-5"
          style={{
            background: "rgba(15,12,40,0.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "rgba(245,240,160,0.85)" }}>
                Days {milestone.dayStart}–{milestone.dayEnd}
              </p>
              <h3 className="text-white text-[20px] font-bold mt-1">{milestone.title}</h3>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{milestone.sublabel}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full btn-press" style={{ background: "rgba(255,255,255,0.08)" }} aria-label="Close">
              <X className="w-3.5 h-3.5 text-slate-50" />
            </button>
          </div>

          {locked ? (
            <div className="mt-5 rounded-2xl p-5 text-center" style={{ background: "rgba(245,240,160,0.08)", border: "1px solid rgba(245,240,160,0.35)" }}>
              <Crown className="w-6 h-6 mx-auto" style={{ color: "#F5F0A0" }} />
              <p className="text-white text-[15px] font-semibold mt-2">Unlock the rest of your ascent</p>
              <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                Days 4–21 + your full Reset Report.
              </p>
              <button
                onClick={onUpgrade}
                className="mt-4 w-full py-3 rounded-xl font-semibold btn-press"
                style={{ background: "#F5F0A0", color: "#1A2A4A" }}
              >
                Continue my reset →
              </button>
            </div>
          ) : (
            <>
              {/* Day chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {days.map((d) => {
                  const done = completedDays.includes(d) || d < currentDay;
                  const active = d === openDay;
                  const isCurrent = d === currentDay;
                  return (
                    <button
                      key={d}
                      onClick={() => setOpenDay(d)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-semibold btn-press flex items-center gap-1.5"
                      style={{
                        background: active ? "#F5F0A0" : done ? "rgba(29,158,117,0.18)" : "rgba(255,255,255,0.08)",
                        color: active ? "#1A2A4A" : "white",
                        border: isCurrent && !active ? "1px solid #F5F0A0" : "1px solid transparent",
                      }}
                    >
                      {done && <Check className="w-3 h-3" />}
                      Day {d}
                    </button>
                  );
                })}
              </div>

              {/* Practices for selected day */}
              <div className="mt-4 max-h-[46vh] overflow-y-auto space-y-3 pr-1">
                {neuro && <PracticeCard practice={neuro} whyForToday={why} />}
                {ayurveda && <PracticeCard practice={ayurveda} whyForToday={why} />}
                {!ayurveda && (
                  <p className="text-[12px] italic px-1" style={{ color: "rgba(245,240,160,0.85)" }}>
                    Take the dosha quiz in your profile to unlock personalised Ayurvedic practices.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main screen ──────────────────────────────────────────────── */
const JourneyScreen = () => {
  const nav = useNavigate();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const [localPro, setLocalPro] = useState<boolean>(() => {
    try { return localStorage.getItem("restart_pro") === "true"; } catch { return false; }
  });
  useEffect(() => {
    const onStorage = () => {
      try { setLocalPro(localStorage.getItem("restart_pro") === "true"); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const isPro = isActive || localPro;

  const day = profile?.current_day ?? (() => {
    try { return parseInt(localStorage.getItem("restart_day") || "1"); } catch { return 1; }
  })();

  const [completedDays, setCompletedDays] = useState<number[]>(() => getCompletedDays());
  useEffect(() => {
    const refresh = () => setCompletedDays(getCompletedDays());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const [openMilestone, setOpenMilestone] = useState<Milestone | null>(null);
  const [dayCardOpen, setDayCardOpen] = useState<number | null>(null);
  const [glowPulse, setGlowPulse] = useState(0);

  // Soft golden glow when a practice is marked done anywhere in the app.
  useEffect(() => {
    const onDone = () => setGlowPulse((n) => n + 1);
    window.addEventListener("restart:practice-completed", onDone);
    return () => window.removeEventListener("restart:practice-completed", onDone);
  }, []);

  const handleNodeTap = (m: Milestone) => {
    if (day < m.dayStart) {
      toast(`Complete Day ${day} first to unlock this`);
      return;
    }
    const targetDay = Math.min(day, m.dayEnd);
    setDayCardOpen(targetDay);
  };

  /* progress fraction along the path (0 → 1) for the brighter "completed" overlay */
  const progress = useMemo(() => {
    // map currentDay 1→0, 3→1
    const t = Math.min(Math.max((day - 1) / 2, 0), 1);
    return t;
  }, [day]);

  const currentMilestone =
    MILESTONES.find((m) => day >= m.dayStart && day <= m.dayEnd) ?? MILESTONES[0];

  const avatarUrl = (user as any)?.user_metadata?.avatar_url as string | undefined;
  const initials = initialsFor(profile?.name ?? (user as any)?.user_metadata?.name);

  return (
    <div
      className="phone-frame relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#B8D4E8 18%,#4A90D9 55%,#2D1B69 100%)" }}
    >
      <MountainBackdrop />

      {/* Title */}
      <div className="relative z-10 pt-10 pb-6 text-center px-6">
        <h1 className="text-[26px] font-bold" style={{ color: "#1A1A2E", letterSpacing: "-0.02em" }}>
          Your 3-Day Reset
        </h1>
        <p className="text-[12px] mt-1" style={{ color: "rgba(26,26,46,0.55)" }}>
          Day {day} of 3 — keep climbing
        </p>
      </div>

      {/* Path + nodes layered SVG */}
      <div className="relative z-10 mx-auto pb-28" style={{ width: "100%", maxWidth: 380 }}>
        <svg
          viewBox="0 0 400 520"
          className="w-full h-auto"
          style={{ display: "block", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }}
        >
          {/* Peak glow orb */}
          <circle cx="110" cy="90" r="38" fill="#FFFFFF" opacity="0.3">
            <animate attributeName="opacity" values="0.25;0.6;0.25" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="90" r="18" fill="#FFFFFF" opacity="0.85" />

          {/* Upcoming path — drawn first (full draw animation) */}
          <motion.path
            d={PATH_D}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="6 10"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Completed (warm) section overlaid */}
          <motion.path
            d={PATH_D}
            fill="none"
            stroke="#F5E1A0"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
            style={{ filter: "drop-shadow(0 0 10px rgba(245,225,160,0.7))" }}
          />

          {/* Nodes */}
          {MILESTONES.map((m) => {
            const status = milestoneStatus(m, day);
            const locked = m.requiresPro && !isPro;
            const isPeak = m.id === "m3";
            const isDay1 = m.id === "m1";
            const r = isPeak ? 26 : isDay1 ? 28 : 22;
            const hitR = isDay1 ? 56 : r + 14;
            const fill =
              status === "done"
                ? "#F5E1A0"
                : status === "current"
                ? "#FFFFFF"
                : locked
                ? "rgba(255,255,255,0.45)"
                : "rgba(255,255,255,0.85)";
            return (
              <g
                key={m.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleNodeTap(m)}
              >
                {/* Invisible larger tap target — especially generous for Day 1 */}
                <circle cx={m.x} cy={m.y} r={hitR} fill="rgba(0,0,0,0)" />
                {/* outer halo for current */}
                {status === "current" && (
                  <circle cx={m.x} cy={m.y} r={r + 10} fill="#FFFFFF" opacity="0.25">
                    <animate attributeName="r" values={`${r + 6};${r + 14};${r + 6}`} dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={r}
                  fill={fill}
                  stroke="#FFFFFF"
                  strokeWidth={status === "current" ? 3 : 1.5}
                  opacity={locked && status !== "current" ? 0.7 : 1}
                />
                {/* day numeral inside / beside */}
                <text
                  x={m.x}
                  y={m.y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#1A2A4A"
                >
                  {String(m.dayStart)}
                </text>
                {/* crown for locked */}
                {locked && !isPeak && (
                  <g transform={`translate(${m.x + 14},${m.y - 22})`}>
                    <circle r="9" fill="#1A2A4A" />
                    <text x="0" y="3.5" textAnchor="middle" fontSize="10" fill="#F5E1A0">♛</text>
                  </g>
                )}
              </g>
            );
          })}

        </svg>

        {/* HTML labels positioned over the SVG (percentage positioned to scale with width) */}
        <div className="absolute inset-0 pointer-events-none">
          {MILESTONES.map((m) => {
            const xPct = (m.x / 400) * 100;
            const yPct = (m.y / 520) * 100;
            const status = milestoneStatus(m, day);
            const locked = m.requiresPro && !isPro;
            const align =
              m.side === "left"
                ? { right: `${100 - xPct + 8}%`, textAlign: "right" as const, transform: "translateY(-50%)" }
                : m.side === "right"
                ? { left: `${xPct + 8}%`, textAlign: "left" as const, transform: "translateY(-50%)" }
                : { left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" as const };
            const topStyle = { top: `${yPct}%` };

            return (
              <div
                key={m.id}
                className="absolute"
                style={{
                  ...topStyle,
                  ...align,
                  maxWidth: "46%",
                  opacity: locked && status !== "current" ? 0.55 : 1,
                }}
              >
                <p
                  className="text-[13px] font-bold leading-tight"
                  style={{ color: "#FFFFFF", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  {m.title}
                </p>
                <p
                  className="text-[11px] leading-tight mt-0.5"
                  style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}
                >
                  {m.sublabel}
                </p>
                <p
                  className="text-[10px] mt-1 font-semibold tracking-wide uppercase"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Day {m.dayStart === m.dayEnd ? m.dayStart : `${m.dayStart}–${m.dayEnd}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice-completion glow — soft warm golden, fades out in ~1s */}
      <AnimatePresence>
        {glowPulse > 0 && (
          <motion.div
            key={glowPulse}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-30"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(245,225,160,0.55) 0%, rgba(245,225,160,0.18) 35%, rgba(245,225,160,0) 70%)",
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      <BottomNav />

      <AnimatePresence>
        {openMilestone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMilestone(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.45)" }}
            />
            <MilestoneSheet
              milestone={openMilestone}
              currentDay={day}
              completedDays={completedDays}
              isPro={isPro}
              onClose={() => setOpenMilestone(null)}
              onUpgrade={() => { setOpenMilestone(null); }}
            />
          </>
        )}
        {dayCardOpen !== null && (
          <>
            <motion.div
              key="daycard-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDayCardOpen(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <DayCard
              key={`daycard-${dayCardOpen}`}
              day={dayCardOpen}
              currentDay={day}
              completedDays={completedDays}
              dosha={(profile as any)?.dosha ?? null}
              chronotype={(profile as any)?.chronotype ?? null}
              userName={profile?.name ?? (user as any)?.user_metadata?.name ?? "you"}
              isPro={isPro}
              onClose={() => setDayCardOpen(null)}
              onAdvance={() => {
                const next = advanceToNextDay(dayCardOpen);
                setCompletedDays(getCompletedDays());
                setDayCardOpen(next);
              }}
              onUpgrade={() => { setDayCardOpen(null); }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JourneyScreen;