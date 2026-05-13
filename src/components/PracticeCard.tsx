import { ExternalLink, ArrowRight } from "lucide-react";
import type { Practice } from "@/data/practices";

interface PracticeCardProps {
  practice: Practice;
  whyForToday?: string; // optional override (e.g. journey "why today" copy)
  onStart?: (p: Practice) => void;
}

const badgeStyle = (category: Practice["category"]): React.CSSProperties => ({
  display: "inline-block",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  background: category === "Neuroscience" ? "rgba(123,155,214,0.18)" : "rgba(29,158,117,0.18)",
  color: category === "Neuroscience" ? "#3b5d8c" : "#0f6e4f",
});

const PracticeCard = ({ practice, whyForToday, onStart }: PracticeCardProps) => {
  const categoryLabel =
    practice.category === "Neuroscience"
      ? "Neuroscience"
      : `Ayurveda — ${practice.dosha ?? ""}`.trim();

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(26,42,74,0.08)",
        boxShadow: "0 6px 24px -12px rgba(26,42,74,0.18)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span style={badgeStyle(practice.category)}>{categoryLabel}</span>
        <span style={{ fontSize: 11, color: "rgba(26,42,74,0.55)", fontWeight: 500 }}>
          {practice.duration}
        </span>
      </div>

      <h3
        className="mt-3"
        style={{
          fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
          fontSize: 20,
          lineHeight: 1.2,
          fontWeight: 600,
          color: "#1A2A4A",
        }}
      >
        {practice.name}
      </h3>

      <p
        className="mt-2"
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: "rgba(26,42,74,0.72)",
        }}
      >
        {whyForToday || practice.whyForMood}
      </p>

      <button
        type="button"
        onClick={() => onStart?.(practice)}
        className="mt-4 w-full flex items-center justify-center gap-2 btn-press"
        style={{
          background: "#1A2A4A",
          color: "white",
          padding: "12px 18px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        Start now <ArrowRight size={15} />
      </button>

      <a
        href={practice.sourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1"
        style={{
          fontSize: 11,
          color: "rgba(26,42,74,0.55)",
          textDecoration: "none",
        }}
      >
        {practice.sourceLabel} <ExternalLink size={11} />
      </a>
    </div>
  );
};

export default PracticeCard;
