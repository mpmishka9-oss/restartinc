import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { getDidiScript, fillName } from "@/data/didiScripts";
import type { Practice } from "@/data/practices";

interface Props {
  practice: Practice | null;
  open: boolean;
  userName: string;
  onClose: () => void;
}

/**
 * Didi's real-time guided overlay. Sits above the timer / practice UI.
 * Walks: BEFORE → DURING[] → AFTER. Tap-to-advance + auto-advance during
 * the DURING phase, paced evenly across the practice duration.
 */
const DidiGuidance = ({ practice, open, userName, onClose }: Props) => {
  const script = practice ? getDidiScript(practice.id) : null;
  const lines = useMemo(() => {
    if (!script) return [] as { phase: "before" | "during" | "after"; text: string }[];
    return [
      { phase: "before" as const, text: script.before },
      ...script.during.map((t) => ({ phase: "during" as const, text: t })),
      { phase: "after" as const, text: script.after },
    ];
  }, [script]);

  const [idx, setIdx] = useState(0);

  // Reset whenever the overlay re-opens for a new practice.
  useEffect(() => { if (open) setIdx(0); }, [open, practice?.id]);

  // Auto-advance during the DURING phase only.
  useEffect(() => {
    if (!open || !script || !practice) return;
    const current = lines[idx];
    if (!current || current.phase !== "during") return;
    // Pace evenly across the parsed duration in minutes (default 5 min).
    const minutes = parseInt(practice.duration?.match(/\d+/)?.[0] ?? "5", 10) || 5;
    const duringCount = script.during.length || 1;
    const perStepMs = Math.max(8000, Math.round((minutes * 60_000) / duringCount));
    const id = window.setTimeout(() => {
      setIdx((i) => Math.min(i + 1, lines.length - 1));
    }, perStepMs);
    return () => clearTimeout(id);
  }, [open, idx, lines, script, practice]);

  if (!practice || !script) return null;

  const current = lines[idx];
  const isLast = idx >= lines.length - 1;
  const text = fillName(current?.text ?? "", userName);
  const phaseLabel =
    current?.phase === "before" ? "Before you begin"
      : current?.phase === "after" ? "After"
      : `Step ${idx} of ${script.during.length}`;

  const advance = () => {
    if (isLast) onClose();
    else setIdx((i) => i + 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(5,3,20,0.55)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4 mb-6 rounded-3xl p-5"
            style={{
              background: "rgba(20,15,55,0.97)",
              border: "1px solid rgba(245,225,160,0.35)",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex w-7 h-7 rounded-full items-center justify-center"
                  style={{ background: "rgba(245,225,160,0.18)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#F5E1A0" }} />
                </span>
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase font-bold"
                     style={{ color: "rgba(245,225,160,0.85)" }}>
                    Didi · {practice.name}
                  </p>
                  <p className="text-[10px]" style={{ color: "#ffffff" }}>
                    {phaseLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-full btn-press"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X className="w-3.5 h-3.5 text-slate-50" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[16px] leading-relaxed mt-4"
                style={{ color: "#fdfcb8" }}
              >
                {text}
              </motion.p>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-4">
              {lines.map((_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    background: i <= idx ? "rgba(245,225,160,0.9)" : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>

            {isLast && (
              <div className="mt-3 flex flex-col gap-1">
                <a
                  href={practice.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 11, color: "rgba(245,225,160,0.55)", textDecoration: "underline" }}
                >
                  Source: {practice.sourceLabel}
                </a>
                {practice.sourceLink2 && (
                  <a
                    href={practice.sourceLink2}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 11, color: "rgba(245,225,160,0.55)", textDecoration: "underline" }}
                  >
                    Source: {practice.sourceLabel2}
                  </a>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={advance}
              className="mt-4 w-full py-3 rounded-xl font-bold btn-press flex items-center justify-center gap-2"
              style={{ background: "#F5E1A0", color: "#1A2A4A", fontSize: 14 }}
            >
              {isLast ? "Done" : current?.phase === "before" ? "Begin" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DidiGuidance;