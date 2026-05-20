import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { isDemoMode } from "@/lib/demo";

/* ────────────────────────────────────────────────────────────────
   Day 3 completion → feedback → thank-you.
   Three internal steps controlled by local state.
   ──────────────────────────────────────────────────────────────── */

const BUTTER = "#fdfcb8";
const NAVY = "#1A2A4A";
const CREAM = "#e8e4a0";

const readMood = (day: number): number => {
  try {
    const v = parseInt(localStorage.getItem(`restart_mood_d${day}`) || "0", 10);
    if (Number.isFinite(v) && v >= 1 && v <= 5) return v;
  } catch {}
  return 0;
};

/* ────────── Mood arc bars ────────── */
const MoodArc = ({ d1, d2, d3 }: { d1: number; d2: number; d3: number }) => {
  // D3 visually always tallest per spec.
  const heights = [d1 || 1, d2 || 2, Math.max(d3 || 4, d1 + 1, d2 + 1, 4)];
  const max = 5;
  return (
    <div>
      <p
        className="text-[10px] tracking-[0.22em] uppercase font-bold mb-2"
        style={{ color: "rgba(26,42,74,0.55)" }}
      >
        Your mood arc — 3 days
      </p>
      <div
        className="flex items-end justify-around h-32 px-4 rounded-2xl"
        style={{ background: "rgba(26,42,74,0.06)" }}
      >
        {heights.map((h, i) => {
          const pct = Math.min(100, (h / max) * 100);
          const isD3 = i === 2;
          return (
            <div key={i} className="flex flex-col items-center justify-end h-full gap-1.5" style={{ width: "20%" }}>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${pct}%`,
                  background: isD3 ? BUTTER : "rgba(26,42,74,0.35)",
                  boxShadow: isD3 ? "0 0 18px rgba(253,252,184,0.5)" : undefined,
                  transition: "height 600ms ease-out",
                }}
              />
              <span className="text-[11px] font-bold" style={{ color: NAVY }}>
                D{i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ────────── Step A: Completion ────────── */
const CompletionStep = ({ onNext, d1, d2, d3 }: { onNext: () => void; d1: number; d2: number; d3: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="phone-frame min-h-screen px-6 pt-14 pb-24"
    style={{
      background:
        "radial-gradient(circle at 50% 18%, #fdfcb8 0%, #e6d68f 16%, #7B9BD6 58%, #1A2A4A 100%)",
    }}
  >
    <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-center" style={{ color: "rgba(26,42,74,0.6)" }}>
      Day 3 Complete
    </p>
    <h1 className="text-[34px] font-bold text-center mt-3 leading-tight" style={{ color: NAVY }}>
      You restarted.
    </h1>
    <p className="text-[15px] text-center mt-3 leading-relaxed text-slate-500">
      3 days. 6 practices. One nervous system that knows the difference now.
    </p>

    <div className="mt-7">
      <MoodArc d1={d1} d2={d2} d3={d3} />
    </div>

    <div
      className="mt-7 rounded-2xl p-5"
      style={{ background: "rgba(15,12,40,0.92)", border: "1px solid rgba(253,252,184,0.35)" }}
    >
      <p className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: "rgba(245,225,160,0.85)" }}>
        Didi says
      </p>
      <p className="text-[15px] italic mt-2 leading-snug" style={{ color: BUTTER }}>
        "This is what regulation feels like. Remember it — this is your new baseline."
      </p>
    </div>

    <button
      onClick={onNext}
      className="mt-7 w-full py-3.5 rounded-xl font-bold btn-press inline-flex items-center justify-center gap-2"
      style={{ background: CREAM, color: NAVY, fontSize: 15 }}
    >
      Tell us what you experienced <ArrowRight className="w-4 h-4" />
    </button>
    <p className="text-[11px] mt-2 text-center" style={{ color: "rgba(26,42,74,0.6)" }}>
      Takes 2 minutes · Shapes what we build next
    </p>
  </motion.div>
);

/* ────────── Step B: Feedback form ────────── */
interface FormState {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

const Q1_OPTIONS = ["Yes — genuinely felt it", "Somewhat", "Not really"];
const Q3_OPTIONS = ["₹99 – ₹199 / month", "₹299 – ₹499 / month", "₹500+ / month"];
const Q4_OPTIONS = [
  "More Ayurveda depth",
  "Deeper neuroscience",
  "Productivity + focus",
  "Sleep + recovery",
];

const RadioGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <p className="text-[14px] font-semibold mb-2" style={{ color: BUTTER }}>
      {label}
    </p>
    <div className="flex flex-col gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="text-left px-4 py-3 rounded-xl btn-press text-[13px]"
            style={{
              background: active ? CREAM : "rgba(255,255,255,0.06)",
              color: active ? NAVY : "#ffffff",
              border: `1px solid ${active ? CREAM : "rgba(255,255,255,0.12)"}`,
              fontWeight: active ? 700 : 500,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  </div>
);

const FeedbackStep = ({
  onSubmitted,
  d1,
  d2,
  d3,
}: {
  onSubmitted: () => void;
  d1: number;
  d2: number;
  d3: number;
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [form, setForm] = useState<FormState>({ q1: "", q2: "", q3: "", q4: "", q5: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canSubmit = form.q1 && form.q3 && form.q4 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: user?.id ?? null,
      user_name: profile?.name ?? null,
      dosha: (profile as any)?.dosha ?? null,
      chronotype: (profile as any)?.chronotype ?? null,
      mood_d1: d1 || null,
      mood_d2: d2 || null,
      mood_d3: d3 || null,
      q1_felt_difference: form.q1,
      q2_practice_hit_hardest: form.q2,
      q3_pay_monthly: form.q3,
      q4_focus_vote: form.q4,
      q5_message: form.q5,
    };

    try {
      // Always persist to DB first so responses aren't lost if Sheets fails.
      if (user && !isDemoMode()) {
        const { error: dbErr } = await supabase
          .from("restart_feedback")
          .insert(payload as any);
        if (dbErr) throw dbErr;
      }

      // Send email to Mishka via Resend. DB save above ensures responses aren't lost.
      const { data: emailData, error: emailErr } = await supabase.functions.invoke(
        "send-feedback-email",
        { body: payload }
      );
      if (emailErr || (emailData && emailData.ok === false)) {
        throw new Error(emailErr?.message || emailData?.error || "Email failed");
      }

      onSubmitted();
    } catch (e: any) {
      setError("Something went wrong, please try again");
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="phone-frame min-h-screen px-6 pt-14 pb-24"
      style={{
        background:
          "radial-gradient(circle at 50% 18%, #fdfcb8 0%, #e6d68f 16%, #7B9BD6 58%, #1A2A4A 100%)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.22em] uppercase font-bold text-center"
        style={{ color: "rgba(26,42,74,0.6)" }}
      >
        Quick feedback — 5 questions
      </p>
      <p className="text-[13px] text-center mt-2" style={{ color: "#ffffff" }}>
        Your answers shape what RESTART becomes. Be honest.
      </p>

      <div
        className="mt-6 rounded-3xl p-5 space-y-6"
        style={{ background: "rgba(15,12,40,0.92)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <RadioGroup
          label="Did you feel a real difference over 3 days?"
          options={Q1_OPTIONS}
          value={form.q1}
          onChange={(v) => set("q1", v)}
        />

        <div>
          <p className="text-[14px] font-semibold mb-2" style={{ color: BUTTER }}>
            Which practice hit hardest for you?
          </p>
          <input
            value={form.q2}
            onChange={(e) => set("q2", e.target.value)}
            placeholder="Type the practice name..."
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#ffffff",
            }}
          />
        </div>

        <RadioGroup
          label="For a fully built 21-day journey, what would you pay per month?"
          options={Q3_OPTIONS}
          value={form.q3}
          onChange={(v) => set("q3", v)}
        />

        <RadioGroup
          label="What should the full journey focus on?"
          options={Q4_OPTIONS}
          value={form.q4}
          onChange={(v) => set("q4", v)}
        />

        <div>
          <p className="text-[14px] font-semibold mb-2" style={{ color: BUTTER }}>
            Anything else? Tell Mishka directly.
          </p>
          <textarea
            value={form.q5}
            onChange={(e) => set("q5", e.target.value)}
            placeholder="Your thoughts, requests, frustrations, ideas — all of it welcome."
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-y"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#ffffff",
              minHeight: 96,
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-[12px] mt-3 text-center" style={{ color: "#ff8a8a" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full py-3.5 rounded-xl font-bold btn-press inline-flex items-center justify-center gap-2"
        style={{
          background: canSubmit ? CREAM : "rgba(232,228,160,0.4)",
          color: NAVY,
          fontSize: 15,
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="text-[11px] mt-2 text-center" style={{ color: "rgba(26,42,74,0.6)" }}>
        No login needed
      </p>
    </motion.div>
  );
};

/* ────────── Step C: Thank you + waitlist ────────── */
const ThankYouStep = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [email, setEmail] = useState<string>(
    (profile as any)?.email || user?.email || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !submitting;

  const join = async () => {
    if (!valid) return;
    setSubmitting(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-signup", {
        body: {
          email: email.trim(),
          name: (profile as any)?.name ?? null,
          dosha: (profile as any)?.dosha ?? null,
          chronotype: (profile as any)?.chronotype ?? null,
          user_id: user?.id ?? null,
        },
      });
      if (error || (data && data.ok === false)) {
        throw new Error(error?.message || data?.error || "Failed");
      }
      setJoined(true);
    } catch (e: any) {
      setErr("Something went wrong, please try again");
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="phone-frame min-h-screen px-6 pt-20 pb-24"
      style={{
        background:
          "radial-gradient(circle at 50% 22%, #fdfcb8 0%, #e6d68f 14%, #7B9BD6 55%, #1A2A4A 100%)",
      }}
    >
      <div className="text-center">
        <h1 className="text-[36px] font-bold leading-tight" style={{ color: BUTTER }}>
          Thank you.
        </h1>
        <p className="text-[15px] mt-4 leading-relaxed text-slate-800">
          Mishka will read every single one.
        </p>
      </div>

      <div
        className="my-8 h-px w-full"
        style={{ background: "rgba(255,255,255,0.18)" }}
      />

      <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-center text-slate-600">
        What comes next
      </p>
      <h2
        className="text-[22px] font-bold text-center mt-3 leading-snug"
        style={{ color: BUTTER }}
      >
        The full 21-day journey is being built around your answers.
      </h2>
      <p className="text-[14px] text-center mt-3 leading-relaxed" style={{ color: "#ffffff" }}>
        Join the next cohort and be the first to access it.
      </p>

      <div className="mt-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          disabled={joined || submitting}
          maxLength={255}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#ffffff",
          }}
        />

        {joined ? (
          <div
            className="mt-3 w-full py-3.5 rounded-xl text-center font-bold"
            style={{ background: "rgba(253,252,184,0.18)", color: BUTTER, fontSize: 14, border: "1px solid rgba(253,252,184,0.35)" }}
          >
            You're on the list. We'll be in touch.
          </div>
        ) : (
          <button
            onClick={join}
            disabled={!valid}
            className="mt-3 w-full py-3.5 rounded-xl font-bold btn-press inline-flex items-center justify-center gap-2"
            style={{
              background: valid ? CREAM : "rgba(232,228,160,0.4)",
              color: NAVY,
              fontSize: 15,
              cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join the waitlist <ArrowRight className="w-4 h-4" /></>}
          </button>
        )}

        {err && !joined && (
          <p className="text-[12px] mt-2 text-center" style={{ color: "#ff8a8a" }}>
            {err}
          </p>
        )}
      </div>
    </motion.div>
  );
};

/* ────────── Container ────────── */
const CompletionScreen = () => {
  const [step, setStep] = useState<"complete" | "feedback" | "thanks">("complete");
  const moods = useMemo(() => ({ d1: readMood(1), d2: readMood(2), d3: readMood(3) }), []);

  if (step === "complete") return <CompletionStep onNext={() => setStep("feedback")} {...moods} />;
  if (step === "feedback") return <FeedbackStep onSubmitted={() => setStep("thanks")} {...moods} />;
  return <ThankYouStep />;
};

export default CompletionScreen;