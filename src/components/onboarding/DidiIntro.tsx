import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "Hi. I'm Didi.",
  "I'm not a chatbot. I'm not a therapist.",
  "I'm the part of you that already knows what you need — I just help you hear it.",
  "I've been reading everything you shared. I know your rhythm, your blocks, your pattern.",
  "Let me show you who you are.",
];

const TYPE_SPEED = 28; // ms per character
const PAUSE_BETWEEN = 700; // ms between lines

const Typewriter = ({ text, onDone }: { text: string; onDone: () => void }) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setTimeout(onDone, PAUSE_BETWEEN);
      }
    }, TYPE_SPEED);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {out}
      <span
        className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 animate-pulse"
        style={{ backgroundColor: "#F5F0A0" }}
      />
    </span>
  );
};

const DidiIntro = ({ onContinue }: { onContinue: () => void }) => {
  const [lineIdx, setLineIdx] = useState(0);
  const [done, setDone] = useState(false);

  const advance = () => {
    if (lineIdx + 1 >= LINES.length) setDone(true);
    else setLineIdx((i) => i + 1);
  };

  return (
    <div className="phone-frame min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-rs-navy relative overflow-hidden">
      {/* Glowing orb */}
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="relative"
        >
          {/* Outer glow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, #F5F0A0 0%, #7B9BD6 60%, transparent 80%)" }}
          />
          {/* Mid glow */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-40 h-40 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, #F5F0A0 0%, #7B9BD6 70%, transparent 100%)" }}
          />
          {/* Core orb */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #FFFBE0 0%, #F5F0A0 40%, #7B9BD6 100%)",
              boxShadow: "0 0 60px rgba(245,240,160,0.5), inset 0 0 30px rgba(255,255,255,0.4)",
            }}
          />
        </motion.div>
      </div>

      {/* Text */}
      <div className="w-full max-w-md min-h-[200px] flex flex-col gap-4 mb-6">
        <AnimatePresence>
          {LINES.slice(0, lineIdx + 1).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: i === lineIdx ? 1 : 0.45, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[18px] leading-relaxed font-medium text-center bg-transparent"
              style={{
                color: "#F5F0A0",
                background: "none",
                textShadow: "none",
              }}
            >
              {i === lineIdx ? (
                <Typewriter text={line} onDone={advance} />
              ) : (
                line
              )}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* Button */}
      <div className="w-full flex justify-center min-h-[60px]">
        <AnimatePresence>
          {done && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={onContinue}
              className="px-8 py-3.5 rounded-full bg-rs-cream text-rs-navy font-semibold text-[15px] btn-press shadow-lg"
            >
              Show me
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DidiIntro;