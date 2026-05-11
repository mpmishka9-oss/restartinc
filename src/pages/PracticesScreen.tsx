import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, Sparkles, User, ArrowUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import restartLogo from "@/assets/restart-logo.png";

const MOODS = [
  { emoji: "😮‍💨", label: "Anxious" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "😶", label: "Flat" },
  { emoji: "🌀", label: "Overwhelmed" },
  { emoji: "✨", label: "Good" },
];

const chipStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.50)",
  border: "0.5px solid rgba(255,255,255,0.80)",
  borderRadius: 20,
  color: "#1a3a6a",
  fontSize: 13,
  padding: "12px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontWeight: 500,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const PracticesScreen = () => {
  const nav = useNavigate();
  const { profile } = useProfile();
  const firstName = (profile?.name || "").trim().split(" ")[0] || "friend";

  const startCheckIn = (feeling?: string) => {
    try {
      if (feeling) localStorage.setItem("restart_prefill_feeling", feeling);
    } catch {}
    nav("/checkin");
  };

  const navItems = [
    { to: "/home", label: "Home", Icon: Home },
    { to: "/practices", label: "Didi", Icon: Sparkles, active: true },
    { to: "/journey", label: "Journey", Icon: Calendar },
    { to: "/profile", label: "Profile", Icon: User },
  ];

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
      {/* White halo behind brain */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: 80,
          transform: "translateX(-50%)",
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
        }}
      />
      {/* Brain watermark */}
      <img
        src={restartLogo}
        alt=""
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: 80,
          transform: "translateX(-50%)",
          width: 220,
          opacity: 0.28,
          zIndex: 1,
        }}
      />

      {/* Foreground content */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
        {/* Header text */}
        <div className="text-center" style={{ paddingTop: 108 }}>
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
          <div
            style={{
              fontSize: 23,
              fontWeight: 500,
              color: "#1a3a6a",
              marginTop: 8,
              lineHeight: 1.3,
            }}
          >
            How are you,
            <br />
            {firstName}?
          </div>
        </div>

        {/* Mood chips + input — bottom third */}
        <div className="mt-auto px-5" style={{ paddingBottom: 90 }}>
          <button
            type="button"
            onClick={() => startCheckIn("Anxious")}
            style={{ ...chipStyle, width: "100%", marginBottom: 10 }}
          >
            😮‍💨 Anxious
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {MOODS.slice(1).map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => startCheckIn(m.label)}
                style={chipStyle}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div
            onClick={() => startCheckIn()}
            style={{
              ...chipStyle,
              padding: "10px 12px 10px 18px",
              justifyContent: "space-between",
              cursor: "text",
            }}
          >
            <span style={{ color: "rgba(26,58,106,0.55)", fontSize: 13 }}>
              Tell Didi more...
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startCheckIn();
              }}
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
              }}
              aria-label="Send"
            >
              <ArrowUp size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Custom bottom nav matching the spec */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "rgba(200,225,245,0.85)",
            borderTop: "0.5px solid rgba(255,255,255,1)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="phone-frame !min-h-0 flex justify-around py-2.5">
            {navItems.map(({ to, label, Icon, active }) => {
              const color = active ? "#534AB7" : "rgba(30,70,140,0.35)";
              return (
                <button
                  key={to}
                  onClick={() => nav(to)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 btn-press"
                >
                  <Icon className="w-5 h-5" strokeWidth={1.8} style={{ color }} />
                  <span className="text-[10px] font-medium" style={{ color }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </motion.div>
  );
};

export default PracticesScreen;
