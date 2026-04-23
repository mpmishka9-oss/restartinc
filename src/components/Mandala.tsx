// Inner Garden mandala - blooms petals based on completed_practices count.
// Sacred geometry feel using Rangoli-like layered petals.

interface Props { count: number; size?: number; }

const COLORS = ["hsl(209 64% 73%)", "hsl(60 100% 84%)", "hsl(138 36% 75%)", "hsl(207 49% 82%)"];

const Mandala = ({ count, size = 200 }: Props) => {
  // Each "ring" of petals has a fixed petal count
  const RINGS = [
    { petals: 6, radius: 0.18, petalSize: 0.10 },
    { petals: 8, radius: 0.30, petalSize: 0.11 },
    { petals: 12, radius: 0.42, petalSize: 0.10 },
    { petals: 16, radius: 0.54, petalSize: 0.085 },
    { petals: 20, radius: 0.66, petalSize: 0.075 },
  ];
  const center = size / 2;

  // Distribute count across rings progressively
  let remaining = count;
  const ringProgress = RINGS.map(r => {
    const take = Math.min(r.petals, remaining);
    remaining = Math.max(0, remaining - r.petals);
    return take;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        {/* Centre glow */}
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="hsl(60 100% 84%)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="hsl(60 100% 84%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(60 100% 84%)" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        <circle cx={center} cy={center} r={size * 0.09} fill="url(#centerGlow)" className="breathe" />
        <circle cx={center} cy={center} r={size * 0.04} fill="hsl(60 100% 84%)" />

        {RINGS.map((ring, ri) => {
          const filled = ringProgress[ri];
          if (filled === 0) return null;
          const r = size * ring.radius;
          const ps = size * ring.petalSize;
          return Array.from({ length: filled }).map((_, i) => {
            const angle = (i / ring.petals) * Math.PI * 2 - Math.PI / 2;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            const color = COLORS[(ri + i) % COLORS.length];
            return (
              <g key={`${ri}-${i}`} className="bloom" style={{ animationDelay: `${(ri * 80 + i * 30)}ms`, transformOrigin: `${x}px ${y}px` }}>
                <ellipse
                  cx={x} cy={y} rx={ps * 0.55} ry={ps}
                  fill={color}
                  opacity="0.85"
                  filter="url(#softGlow)"
                  transform={`rotate(${(angle * 180 / Math.PI) + 90} ${x} ${y})`}
                />
                <circle cx={x} cy={y} r={ps * 0.18} fill="hsl(60 100% 84%)" opacity="0.7" />
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
};

export default Mandala;
