import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

interface Props {
  onAccept: () => void;
}

const ConsentForm = ({ onAccept }: Props) => {
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const clauses = [
    "The suggestions, practices, and insights provided by ReStart — including neuroscience techniques, Ayurvedic practices, and Didi's guidance — are for general well-being and self-improvement only.",
    "ReStart is not a medical service, mental health treatment, or substitute for professional care. If you are experiencing a mental health crisis, please seek help from a qualified professional.",
    "Your responses, chronotype data, and usage patterns are stored securely and used only to personalise your ReStart experience. We do not sell or share your data with third parties.",
    "You are in control. You may pause, reset, or delete your data at any time from your profile settings. Participation is entirely voluntary.",
    "By continuing, you acknowledge that you are 13 years of age or older and agree to ReStart's Terms of Use and Privacy Policy.",
  ];

  const handleSubmit = async () => {
    if (!agreed) { setError(true); return; }
    setSubmitting(true);
    const iso = new Date().toISOString();
    localStorage.setItem("restart_consent_accepted", iso);
    if (user) {
      await supabase.from("profiles").update({ consent_given_at: iso }).eq("id", user.id);
    }
    setSubmitting(false);
    onAccept();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center pt-10 pb-6"
      style={{ background: "radial-gradient(circle at top, #B8D4E0, #F0EDE6)" }}
    >
      <img src={logo} alt="ReStart" style={{ width: 80 }} className="mb-4" />
      <h1 style={{ color: "#1A2A4A", fontWeight: 700, fontSize: 20 }}>Before we begin</h1>
      <p style={{ color: "rgba(26,42,74,0.6)", fontSize: 13, fontStyle: "italic", marginTop: 4 }}>
        This takes 10 seconds. It matters.
      </p>

      <div
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: 20,
          padding: "24px 20px",
          margin: "16px 20px",
          maxHeight: "52vh",
          overflowY: "auto",
          alignSelf: "stretch",
        }}
      >
        <div style={{ color: "#1A2A4A", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          ReStart Wellness Agreement
        </div>
        <div style={{ color: "rgba(26,42,74,0.45)", fontSize: 11, marginBottom: 16 }}>
          Entered on {today}
        </div>
        <div style={{ borderTop: "1px solid rgba(26,42,74,0.1)", marginBottom: 16 }} />
        <div className="space-y-3">
          {clauses.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, color: "#1A2A4A", fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: "#7B9BD6", fontWeight: 700 }}>•</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ alignSelf: "stretch", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { setAgreed(!agreed); setError(false); }}
            aria-label="Toggle agreement"
            style={{
              width: 44, height: 26, borderRadius: 999,
              background: agreed ? "#5BAEE0" : "rgba(26,42,74,0.2)",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, left: agreed ? 21 : 3,
                width: 20, height: 20, borderRadius: "50%", background: "white",
                transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
          <span style={{ fontSize: 13, color: "#1A2A4A" }}>
            I have read and agree to the above
          </span>
        </div>
        {error && !agreed && (
          <div style={{ fontSize: 11, color: "#E05A5A", marginTop: 6 }}>
            Please agree to continue
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          style={{
            width: "100%", height: 52, borderRadius: 14, fontSize: 15, fontWeight: 700,
            color: "white", marginTop: 20,
            background: agreed ? "#1A2A4A" : "rgba(26,42,74,0.3)",
            cursor: agreed ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          I'm ready to begin
        </button>

        <p style={{
          textAlign: "center", fontSize: 10, fontStyle: "italic",
          color: "rgba(26,42,74,0.4)", marginTop: 12,
        }}>
          ReStart is a wellness tool, not a medical device.
        </p>
      </div>
    </motion.div>
  );
};

export default ConsentForm;