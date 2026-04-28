// 7-segment circular mandala: shows progress through current 7-day phase.
// Reads completedDays from localStorage "restart_completed_days".
// Phase determined from localStorage "restart_day" (or `day` prop fallback).
const Mandala = ({ day, size = 120 }: { day?: number; size?: number }) => {
  const storedDay =
    typeof window !== "undefined" ? Number(localStorage.getItem("restart_day")) : NaN;
  const currentDay = Number.isFinite(storedDay) && storedDay > 0 ? storedDay : day ?? 1;

  // Phase window
  const phaseStart = currentDay <= 7 ? 1 : currentDay <= 14 ? 8 : 15;
  const phaseEnd = phaseStart + 6;

  let completedDays: number[] = [];
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("restart_completed_days")
        : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) completedDays = parsed.filter((n) => typeof n === "number");
    }
  } catch {
    completedDays = [];
  }
  const inPhase = completedDays.filter((d) => d >= phaseStart && d <= phaseEnd);
  const filledCount = Math.min(7, inPhase.length);

  const cx = size / 2,
    cy = size / 2;
  const r = size / 2 - 10;
  const segDeg = 51; // ~51 degrees per segment with ~2 degree gaps (7*51 + 7*~2 ≈ 371)
  const gapDeg = 2;
  const totalSpan = segDeg + gapDeg;

  const polar = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
  };

  const arcs = Array.from({ length: 7 }, (_, i) => {
    const start = i * totalSpan + gapDeg / 2;
    const end = start + segDeg;
    const p0 = polar(start);
    const p1 = polar(end);
    return {
      d: `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`,
      on: i < filledCount,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((a, i) => (
            <path
              key={i}
              d={a.d}
              fill="none"
              stroke={a.on ? "var(--rs-cream)" : "rgba(255,255,255,0.15)"}
              strokeWidth={10}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: "var(--rs-cream)", fontSize: 24, fontWeight: 700 }}>
            {filledCount}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>of 7</span>
        </div>
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "var(--rs-muted, rgba(255,255,255,0.65))",
          textAlign: "center",
        }}
      >
        Inner Garden
      </p>
    </div>
  );
};
export default Mandala;
