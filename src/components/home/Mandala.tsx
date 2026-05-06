// 7-segment circular mandala using filled ring segments.
const Mandala = ({ day, size = 120 }: { day?: number; size?: number }) => {
  const currentDay = (() => {
    if (typeof window === "undefined") return day ?? 1;
    const v = parseInt(localStorage.getItem("restart_day") || "");
    return Number.isFinite(v) && v > 0 ? v : day ?? 1;
  })();

  const phaseStart = currentDay <= 7 ? 1 : currentDay <= 14 ? 8 : 15;
  const phaseEnd = phaseStart + 6;

  let completedDays: number[] = [];
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("restart_completed_days") : null;
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) completedDays = parsed.filter((n) => typeof n === "number");
  } catch {}
  const phaseCompleted = completedDays.filter((d) => d >= phaseStart && d <= phaseEnd);
  const completedCount = Math.min(7, phaseCompleted.length);

  const cx = 60, cy = 60, rOuter = 52, rInner = 42;
  const segSpan = 48.4;
  const step = 51.4;

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
      : completedCount === 3
      ? "3 days in — habit forming 🌱"
      : completedCount === 7
      ? "Phase complete ✓"
      : `Day ${currentDay} of your reset`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {Array.from({ length: 7 }).map((_, i) => (
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
          of 7
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
