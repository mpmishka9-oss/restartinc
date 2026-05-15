import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { isDemoMode } from "@/lib/demo";
import {
  getPracticesForStateWithHistory,
  getUserPracticeHistory,
} from "@/lib/getPracticesForState";

// ----- Emotion options -----
type Emotion = {
  label: string;
  key: string; // maps to STATE_OPTIONS in getPracticesForState
  detected: string; // DB enum value
  reply: string;
};

const EMOTIONS: Emotion[] = [
  { label: "Anxious / worried",        key: "anxious",     detected: "anxiety",   reply: "That restless feeling in your chest — I see it. Let's work with it." },
  { label: "Stressed / under pressure", key: "stressed",    detected: "stress",    reply: "You're carrying a lot right now. That makes sense." },
  { label: "Low / sad",                key: "low",         detected: "burnout",   reply: "Some days just feel heavier. You showed up anyway — that matters." },
  { label: "Overwhelmed / scattered",  key: "overwhelmed", detected: "overwhelm", reply: "When everything feels like too much, we start with one thing." },
  { label: "Angry / frustrated",       key: "angry",       detected: "stress",    reply: "That frustration is information. Let's use it." },
  { label: "Focused and clear",        key: "focused",     detected: "peak",      reply: "You're in a good window. Let's protect it." },
  { label: "Good / motivated",         key: "good",        detected: "peak",      reply: "This is your moment. Let's build on it." },
  { label: "Numb / flat",              key: "numb",        detected: "burnout",   reply: "Flat days are real. We don't need to fix it — just move through it." },
];

const INTENSITY_COPY: Record<string, { question: string; low: string; mid: string; high: string }> = {
  anxious: {
    question: "How loud is the worry right now?",
    low: "A quiet hum in the background",
    mid: "It's present and hard to ignore",
    high: "It's taking over right now",
  },
  stressed: {
    question: "How heavy is the pressure feeling?",
    low: "Manageable, but it's building",
    mid: "It's sitting on your chest",
    high: "Feels like too much right now",
  },
  low: {
    question: "How deep is the heaviness?",
    low: "A dull ache, quietly there",
    mid: "It's slowing you down",
    high: "Feels hard to move through",
  },
  overwhelmed: {
    question: "How scattered does your mind feel?",
    low: "A little noisy, but manageable",
    mid: "Hard to land on one thing",
    high: "Everything feels like too much",
  },
  angry: {
    question: "How activated are you right now?",
    low: "A low simmer",
    mid: "It's sharp and present",
    high: "Fully charged, hard to contain",
  },
  numb: {
    question: "How far away does everything feel?",
    low: "Slightly disconnected",
    mid: "Going through the motions",
    high: "Completely switched off",
  },
  focused: {
    question: "How strong is your focus right now?",
    low: "Just warming up",
    mid: "Steady — you're in it",
    high: "Full flow — sharp and on",
  },
  good: {
    question: "How alive is this energy feeling?",
    low: "A gentle lift",
    mid: "Solid and moving forward",
    high: "Fully charged — let's go",
  },
};

const getIntensityCopy = (key: string | undefined) =>
  (key && INTENSITY_COPY[key]) || INTENSITY_COPY.stressed;

const intensityLine = (n: number, key?: string) => {
  const c = getIntensityCopy(key);
  return n <= 3 ? c.low : n <= 6 ? c.mid : c.high;
};

const chipStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.50)",
  border: "0.5px solid rgba(255,255,255,0.80)",
  borderRadius: 20,
  color: "#1a3a6a",
  fontSize: 14,
  padding: "14px 18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  width: "100%",
  marginBottom: 8,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  textAlign: "center",
};

type Step = "emotion" | "intensity" | "submitting";

const CheckInScreen = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const firstName = (profile?.name || "").trim().split(" ")[0] || "friend";

  const [step, setStep] = useState<Step>("emotion");
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [freeText, setFreeText] = useState("");
  const [didiReply, setDidiReply] = useState<string>("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [alreadyChecked, setAlreadyChecked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("restart_checkin_date") === new Date().toDateString();
    } catch { return false; }
  });

  // Prefill from PracticesScreen
  useEffect(() => {
    try {
      const pf = localStorage.getItem("restart_prefill_feeling");
      if (pf) {
        const match = EMOTIONS.find((e) =>
          e.label.toLowerCase().includes(pf.toLowerCase()) ||
          e.key.toLowerCase() === pf.toLowerCase()
        );
        if (match) {
          setSelected(match);
          setDidiReply(match.reply);
        }
        localStorage.removeItem("restart_prefill_feeling");
      }
    } catch {}
  }, []);

  const pickEmotion = (e: Emotion) => {
    setSelected(e);
    setDidiReply(e.reply);
  };

  const sendFreeText = async () => {
    const text = freeText.trim();
    if (!text || loadingReply) return;
    setLoadingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke("didi-chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `I'm checking in. Here's how I feel: "${text}". Respond in 2 sentences max, warm and direct, no toxic positivity. Just acknowledge the emotion specifically and offer presence — no advice yet.`,
            },
          ],
          context: {
            first_name: firstName,
            chronotype: profile?.chronotype || "",
          },
        },
      });
      if (error) throw error;
      const reply = (data?.reply as string) || "I hear you. Let's stay with this for a moment.";
      setDidiReply(reply);
      // If no chip selected, infer best-fit emotion from keywords (fallback to Stressed)
      if (!selected) {
        const lower = text.toLowerCase();
        const inferred =
          EMOTIONS.find((e) => lower.includes(e.key)) ||
          EMOTIONS.find((e) => e.label.toLowerCase().split(" ")[0].replace("/", "").trim() && lower.includes(e.label.toLowerCase().split(" ")[0])) ||
          EMOTIONS[1]; // stressed default
        setSelected(inferred);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Didi couldn't respond — try again?");
    } finally {
      setLoadingReply(false);
    }
  };

  const submit = async () => {
    if (!selected) return;
    setStep("submitting");
    try {
      const day = parseInt(
        (typeof window !== "undefined" && localStorage.getItem("restart_day")) || "1",
        10,
      ) || 1;

      const oa = (profile as any)?.onboarding_answers || {};
      const onboardingAnswers: Record<string, string> = {
        ...oa,
        blocker: freeText || oa.blocker || "",
      };
      try {
        const sn = localStorage.getItem("restart_support_needed");
        if (sn) onboardingAnswers.support_needed = sn;
      } catch {}

      const history = user
        ? await getUserPracticeHistory(user.id)
        : { shownAll: [], shownRecent: [] };
      const triad = getPracticesForStateWithHistory(
        selected.key,
        day,
        onboardingAnswers,
        history,
      );
      const triadIds = [triad.neuro.id, triad.ayurveda.id, triad.breathwork.id];

      const message = freeText
        ? `Feeling ${selected.label.toLowerCase()}. Intensity ${intensity}/10. "${freeText}"`
        : `Feeling ${selected.label.toLowerCase()}. Intensity ${intensity}/10.`;

      if (user && !isDemoMode()) {
        await supabase.from("check_ins").insert({
          user_id: user.id,
          detected_state: selected.detected as any,
          severity_score: intensity,
          intensity_score: intensity,
          assigned_level: intensity <= 3 ? 1 : intensity <= 7 ? 2 : 3,
          message,
          didi_response: didiReply || selected.reply,
          blocker: freeText || null,
          onboarding_path: (profile?.path as string) || null,
          chronotype: (profile?.chronotype as string) || null,
          day_number: day,
          time_of_checkin: new Date().toISOString(),
          practices_shown: triadIds,
        } as any);
      }

      try {
        localStorage.setItem("restart_checkin_state", selected.key);
        localStorage.setItem("restart_checkin_emotion", selected.key);
        localStorage.setItem("restart_checkin_intensity", String(intensity));
        localStorage.setItem("restart_checkin_freetext", freeText);
        localStorage.setItem("restart_checkin_date", new Date().toDateString());
      } catch {}

      nav("/journey");
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't save check-in — try again?");
      setStep("intensity");
    }
  };

  // ---------- SCREEN 1: emotion ----------
  if (step === "emotion") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="phone-frame min-h-screen relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #feffaf 0%, #c8dde8 22%, #a0c8dc 48%, #7bb0cc 78%, #5a9bb8 100%)",
        }}
      >
        <div className="relative flex flex-col min-h-screen px-5" style={{ zIndex: 2 }}>
          {/* Header */}
          <div className="text-center" style={{ paddingTop: 72 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "rgba(30,80,150,0.55)",
                fontWeight: 600,
              }}
            >
              DIDI
            </div>
            <div className="text-yellow-100 font-serif text-5xl font-semibold mt-2 leading-[1.1]">
              How are you,
              <br />
              {firstName}?
            </div>
          </div>

          {/* Didi reply bubble */}
          <AnimatePresence>
            {(didiReply || loadingReply) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "0.5px solid rgba(255,255,255,0.9)",
                  borderRadius: 18,
                  padding: "14px 16px",
                  color: "#1a3a6a",
                  fontSize: 14,
                  lineHeight: 1.5,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: "0.16em", fontWeight: 600, opacity: 0.55, marginBottom: 4 }}>
                  DIDI
                </div>
                {loadingReply ? (
                  <span style={{ opacity: 0.6 }}>Didi is reading…</span>
                ) : (
                  didiReply
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emotion chips */}
          <div className="mt-6">
            {EMOTIONS.map((e) => {
              const active = selected?.key === e.key;
              return (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => pickEmotion(e)}
                  style={{
                    ...chipStyle,
                    background: active ? "#feffaf" : chipStyle.background,
                    border: active ? "0.5px solid rgba(255,255,255,1)" : chipStyle.border,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {e.label}
                </button>
              );
            })}
          </div>

          {/* Free-text input */}
          <div className="mt-3" style={{ paddingBottom: didiReply ? 16 : 32 }}>
            <div
              style={{
                ...chipStyle,
                marginBottom: 0,
                padding: "10px 12px 10px 18px",
                justifyContent: "space-between",
              }}
            >
              <input
                value={freeText}
                onChange={(ev) => setFreeText(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") sendFreeText();
                }}
                placeholder="Tell Didi more..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#1a3a6a",
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={sendFreeText}
                disabled={!freeText.trim() || loadingReply}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#6B63D4",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                  marginLeft: 8,
                  opacity: !freeText.trim() || loadingReply ? 0.5 : 1,
                }}
                aria-label="Send"
              >
                {loadingReply ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.4} />}
              </button>
            </div>
          </div>

          {/* Continue */}
          {didiReply && selected && !loadingReply && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setStep("intensity")}
              style={{
                background: "#FEFFAF",
                color: "#1a1a1a",
                borderRadius: 999,
                padding: "14px 22px",
                fontSize: 15,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: "none",
                cursor: "pointer",
                marginBottom: 32,
              }}
            >
              Continue <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // ---------- submitting ----------
  if (step === "submitting") {
    return (
      <div className="phone-frame min-h-screen bg-rs-navy flex items-center justify-center px-6 text-center">
        <div>
          <Loader2 className="w-8 h-8 text-rs-cream animate-spin mx-auto" />
          <p className="text-white mt-4">Saving your check-in…</p>
        </div>
      </div>
    );
  }

  // ---------- SCREEN 2: intensity ----------
  const glowSize = 24 + intensity * 4; // grows with intensity
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="phone-frame min-h-screen bg-rs-navy flex flex-col px-6"
    >
      <div className="text-center" style={{ paddingTop: 96 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 600,
          }}
        >
          DIDI
        </div>
        <div className="text-yellow-100 font-serif text-4xl font-semibold mt-3 leading-[1.15]">
          {getIntensityCopy(selected?.key).question}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center" style={{ paddingTop: 24 }}>
        {/* Number readout */}
        <div className="flex justify-center mb-8">
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              color: "#feffaf",
              fontFamily: "serif",
              lineHeight: 1,
              textShadow: `0 0 ${glowSize}px rgba(254,255,175,${0.3 + intensity * 0.05})`,
            }}
          >
            {intensity}
          </div>
        </div>

        {/* Custom slider */}
        <div className="relative px-2">
          <style>{`
            input.intensity-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 6px;
              background: rgba(255,255,255,0.85);
              border-radius: 999px;
              outline: none;
            }
            input.intensity-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: ${20 + intensity * 1.5}px;
              height: ${20 + intensity * 1.5}px;
              border-radius: 50%;
              background: #feffaf;
              box-shadow: 0 0 ${10 + intensity * 3}px rgba(254,255,175,${0.4 + intensity * 0.05}),
                          0 0 ${4 + intensity * 1.2}px rgba(254,255,175,0.6);
              cursor: pointer;
              border: none;
            }
            input.intensity-slider::-moz-range-thumb {
              width: ${20 + intensity * 1.5}px;
              height: ${20 + intensity * 1.5}px;
              border-radius: 50%;
              background: #feffaf;
              box-shadow: 0 0 ${10 + intensity * 3}px rgba(254,255,175,${0.4 + intensity * 0.05});
              cursor: pointer;
              border: none;
            }
          `}</style>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="intensity-slider"
          />
          <div className="flex justify-between text-[11px] text-white/50 mt-3">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {/* Context line */}
        <p className="text-center text-white/85 text-[15px] mt-10 font-medium">
          {intensityLine(intensity, selected?.key)}
        </p>
      </div>

      <button
        onClick={submit}
        style={{
          background: "#FEFFAF",
          color: "#1a1a1a",
          borderRadius: 999,
          padding: "16px 22px",
          fontSize: 15,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          border: "none",
          cursor: "pointer",
          marginBottom: 40,
        }}
      >
        Show me what helps <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};

export default CheckInScreen;
