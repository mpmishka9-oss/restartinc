import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  const [showDismiss, setShowDismiss] = useState(false);
  const motivational = LINES[dayNumber % 5];

  useEffect(() => {
    const t1 = setTimeout(() => setShowDismiss(true), 3600);
    const t2 = setTimeout(onDismiss, 5200);
    return () => { [t1, t2].forEach(clearTimeout); };
  }, [onDismiss]);

  const PERIWINKLE = "#7B9BD6";
  const CREAM = "#F5F0A0";
  const NAVY = "#1A2A4A";

  const cx = 160, cy = 160;

  // Ring 1 — inner lotus (8 petals)
  const innerPetals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    return (
      <motion.path
        key={`p1-${i}`}
        d="M 160 120 C 172 132, 172 148, 160 160 C 148 148, 148 132, 160 120 Z"
        fill={CREAM}
        stroke={NAVY}
        strokeWidth={1}
        transform={`rotate(${angle} ${cx} ${cy})`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  });

  // Ring 2 — mid lotus (12 longer petals)
  const midPetals = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    return (
      <motion.path
        key={`p2-${i}`}
        d="M 160 70 C 178 95, 178 130, 160 155 C 142 130, 142 95, 160 70 Z"
        fill={PERIWINKLE}
        fillOpacity={0.55}
        stroke={NAVY}
        strokeWidth={1}
        transform={`rotate(${angle + 15} ${cx} ${cy})`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9 + i * 0.035, duration: 0.55, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  });

  // Ring 3 — outer rays (16 thin diamond petals) + dots
  const outerRays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    return (
      <motion.path
        key={`p3-${i}`}
        d="M 160 20 L 167 60 L 160 70 L 153 60 Z"
        fill={CREAM}
        stroke={NAVY}
        strokeWidth={0.8}
        transform={`rotate(${angle} ${cx} ${cy})`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.6 + i * 0.025, duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    );
  });

  const outerDots = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const x = cx + Math.cos(a) * 78;
    const y = cy + Math.sin(a) * 78;
    return (
      <motion.circle
        key={`d-${i}`}
        cx={x} cy={y} r={2.5}
        fill={PERIWINKLE}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.8 + i * 0.02, duration: 0.4 }}
      />
    );
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
      <motion.div
        style={{ position: "relative", width: 320, height: 320 }}
        animate={{ rotate: [0, 4, 0, -4, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      >
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* outer ring circle */}
          <motion.circle
            cx={cx} cy={cy} r={108}
            fill="none" stroke={NAVY} strokeWidth={0.6} strokeOpacity={0.35}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
          />
          {outerRays}
          {outerDots}
          {midPetals}
          {/* mid ring */}
          <motion.circle
            cx={cx} cy={cy} r={62}
            fill="none" stroke={NAVY} strokeWidth={0.8} strokeOpacity={0.4}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.9 }}
          />
          {innerPetals}
          {/* center disc */}
          <motion.circle
            cx={cx} cy={cy} r={38}
            fill={NAVY}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          <motion.circle
            cx={cx} cy={cy} r={38}
            fill="none" stroke={CREAM} strokeWidth={1.2}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          />
        </svg>

        {/* Center text overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: CREAM, opacity: 0.85, margin: 0, textTransform: "uppercase" }}>
            Day
          </p>
          <p style={{ fontSize: 36, fontWeight: 700, color: CREAM, margin: 0, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
            {dayNumber}
          </p>
          <p style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(245,240,160,0.7)", margin: "4px 0 0", textTransform: "uppercase" }}>
            +{xpEarned} XP
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.6, ease: "easeOut" }}
        style={{ textAlign: "center", marginTop: 28, maxWidth: 320 }}
      >
        <p style={{ fontSize: 20, fontWeight: 600, color: NAVY, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Well done{firstName ? `, ${firstName}` : ""}.
        </p>
        <p style={{ fontSize: 13, color: "rgba(26,42,74,0.6)", fontStyle: "italic", marginTop: 8 }}>
          {motivational}
        </p>
      </motion.div>

      {showDismiss && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{
            position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center",
            fontSize: 10, color: "rgba(26,42,74,0.4)", fontStyle: "italic",
          }}
        >
          Tap anywhere to continue
        </motion.p>
      )}
    </div>
  );
};

export default MandalaComplete;