// 7-segment circular mandala: shows progress through Phase 1
const Mandala = ({ day, size = 140 }: { day: number; size?: number }) => {
  const filled = Math.max(0, Math.min(7, day));
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 14;
  const seg = (Math.PI * 2) / 7;
  const arcs = Array.from({ length: 7 }, (_, i) => {
    const a0 = -Math.PI / 2 + i * seg + 0.04;
    const a1 = -Math.PI / 2 + (i + 1) * seg - 0.04;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    return { d: `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`, on: i < filled };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill="none"
          stroke={a.on ? "hsl(var(--rs-cream))" : "rgba(255,255,255,0.18)"}
          strokeWidth="6" strokeLinecap="round" />
      ))}
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{filled}/7</text>
    </svg>
  );
};
export default Mandala;
