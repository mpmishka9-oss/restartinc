import { useEffect, useState } from "react";

const LINES = [
  "Your brain is literally rewiring right now.",
  "Consistency is the only shortcut.",
  "Didi noticed. You showed up again.",
  "18–66 days to a new habit. You're building one.",
  "Every day you do this, it gets easier.",
];

interface Props {
  dayNumber: number;
  firstName?: string;
  xpEarned: number;
  onDismiss: () => void;
}

const MandalaComplete = ({ dayNumber, firstName = "", xpEarned, onDismiss }: Props) => {
  const [showXP, setShowXP] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showDismiss, setShowDismiss] = useState(false);
  const [pulse, setPulse] = useState(false);
  const motivational = LINES[dayNumber % 5];

  useEffect(() => {
    const t1 = setTimeout(() => setPulse(true), 2400);
    const t2 = setTimeout(() => setShowText(true), 2600);
    const t3 = setTimeout(() => setShowXP(true), 3000);
    const t4 = setTimeout(() => setShowDismiss(true), 3800);
    const t5 = setTimeout(onDismiss, 4500);
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [onDismiss]);

  // Build petals/segments
  const cx = 120, cy = 120;
  const ring1Petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * 28;
    const y = cy + Math.sin(a) * 28;
    return <ellipse key={i} cx={x} cy={y} rx="14" ry="6" transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} />;
  });
  const ring2Stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * 50;
    const y1 = cy + Math.sin(a) * 50;
    const x2 = cx + Math.cos(a) * 72;
    const y2 = cy + Math.sin(a) * 72;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  const ring3Arcs = Array.from({ length: 16 }, (_, i) => {
    const a1 = (i / 16) * Math.PI * 2;
    const a2 = ((i + 0.7) / 16) * Math.PI * 2;
    const r = 90;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} />;
  });
  const ring4Circles = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const x = cx + Math.cos(a) * 110;
    const y = cy + Math.sin(a) * 110;
    return <circle key={i} cx={x} cy={y} r="4" />;
  });

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "radial-gradient(ellipse at center, rgba(184,212,224,0.97) 0%, rgba(234,232,222,0.97) 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @keyframes mandalaDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        @keyframes mandalaPulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.06);} }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: translateY(0);} }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .m-ring { fill: none; stroke-width: 1.5; stroke-dasharray: 1000; stroke-dashoffset: 1000;
          animation-fill-mode: forwards; animation-timing-function: ease-out; }
        .m-r1 { stroke: #5BAEE0; fill: #5BAEE0; fill-opacity: 0.15; animation: mandalaDraw 0.6s 0s forwards; }
        .m-r2 { stroke: #B8D4E0; animation: mandalaDraw 0.7s 0.5s forwards; }
        .m-r3 { stroke: #C8C0E8; stroke-width: 2; animation: mandalaDraw 0.8s 1s forwards; }
        .m-r4 { stroke: #8A7A20; fill: #F2EE9A; animation: mandalaDraw 0.9s 1.5s forwards; }
      `}</style>
      <div
        style={{
          width: 240, height: 240,
          transformOrigin: "center",
          animation: pulse ? "mandalaPulse 0.6s ease-in-out" : undefined,
        }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          <g className="m-ring m-r1">{ring1Petals}</g>
          <g className="m-ring m-r2">{ring2Stars}</g>
          <g className="m-ring m-r3">{ring3Arcs}</g>
          <g className="m-ring m-r4">{ring4Circles}</g>
        </svg>
      </div>
      {showText && (
        <div style={{ textAlign: "center", marginTop: 16, animation: "fadeIn 0.4s ease-out" }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1A2A4A", margin: 0 }}>Day {dayNumber} complete</p>
          <p style={{ fontSize: 15, color: "#3A6A8A", marginTop: 4 }}>Well done, {firstName}.</p>
          <p style={{ fontSize: 12, color: "rgba(26,42,74,0.6)", fontStyle: "italic", marginTop: 6 }}>{motivational}</p>
        </div>
      )}
      {showXP && (
        <div
          style={{
            marginTop: 18, background: "#F2EE9A", color: "#5A4A1A",
            borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700,
            animation: "fadeUp 0.4s ease-out",
          }}
        >
          +{xpEarned} XP earned
        </div>
      )}
      {showDismiss && (
        <p
          style={{
            position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center",
            fontSize: 10, color: "rgba(26,42,74,0.35)", fontStyle: "italic",
            animation: "fadeIn 0.4s ease-out",
          }}
        >
          Tap anywhere to continue
        </p>
      )}
    </div>
  );
};

export default MandalaComplete;