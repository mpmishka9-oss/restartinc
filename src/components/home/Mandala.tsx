// 6-segment circular mandala: tracks practices completed across the 3-day
// reset (2 practices per day × 3 days = 6).
import { useEffect, useState } from "react";
import { getCompletedPracticesCount, TOTAL_PRACTICES } from "@/lib/dayProgression";

const SEGMENTS = TOTAL_PRACTICES; // 6

const Mandala = ({ day, size = 120 }: { day?: number; size?: number }) => {
  const currentDay = (() => {
    if (typeof window === "undefined") return day ?? 1;
    const v = parseInt(localStorage.getItem("restart_day") || "");
    return Number.isFinite(v) && v > 0 ? v : day ?? 1;
  })();

  const [completedCount, setCompletedCount] = useState<number>(() =>
    Math.min(SEGMENTS, getCompletedPracticesCount()),
  );

  useEffect(() => {
    const refresh = () =>
      setCompletedCount(Math.min(SEGMENTS, getCompletedPracticesCount()));
    refresh();
    window.addEventListener("restart:practice-completed", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("restart:practice-completed", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const cx = 60, cy = 60, rOuter = 52, rInner = 42;
  const gapDeg = 3;
  const step = 360 / SEGMENTS;
  const segSpan = step - gapDeg;

  const segPath = (i: number) => {
    const start = (-90 + i * step) * (Math.PI / 180);
    const end = (-90 + i * step + segSpan) * (Math.PI / 180);
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);
    const x3 = cx + rInner * Math.cos(end);
    const y3 = cy + rInner * Math.sin(end);
    const x4 = cx + rInner * Math.cos(start);
    const y4 = cy + rInner * Math.sin(start);
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
  };

  const fillFor = (i: number) =>
    i < completedCount ? "#F5F0A0" : i === completedCount ? "#7B9BD6" : "rgba(26,42,74,0.12)";

  const phaseLine =
    completedCount === 0
      ? `Day ${currentDay} of your reset`
      : completedCount >= SEGMENTS
      ? "Reset complete ✓"
      : completedCount >= SEGMENTS / 2
      ? "Halfway there — keep going 🌱"
      : `Day ${currentDay} of your reset`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <path
            key={i}
            d={segPath(i)}
            fill={fillFor(i)}
            stroke="transparent"
            strokeWidth={2}
          />
        ))}
        <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="600" fill="#1A2A4A">
          {completedCount}
        </text>
        <text x="60" y="70" textAnchor="middle" fontSize="9" fill="rgba(26,42,74,0.5)">
          of {SEGMENTS}
        </text>
      </svg>
      <p style={{ marginTop: 4, fontSize: 11, color: "rgba(26,42,74,0.5)", textAlign: "center" }}>
        Inner Garden
      </p>
      <p style={{ marginTop: 6, fontSize: 12, color: "rgba(26,42,74,0.55)", textAlign: "center" }}>
        {phaseLine}
      </p>
    </div>
  );
};
export default Mandala;