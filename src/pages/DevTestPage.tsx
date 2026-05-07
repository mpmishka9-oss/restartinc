import React from "react";
import logo from "@/assets/logo.png";

const STATE_KEYS = [
  "restart_name",
  "restart_chronotype",
  "restart_path",
  "restart_day",
  "restart_streak",
  "restart_pro",
  "restart_completed_days",
  "restart_checkin_state",
  "restart_checkin_date",
  "restart_consent_signed",
] as const;

const RESET_KEYS = [
  "restart_day", "restart_completed_days",
  "restart_streak", "restart_pro",
  "restart_checkin_state", "restart_checkin_date",
  "restart_checkin_emotion",
  "restart_consent_signed",
  "restart_consent_signature",
  "restart_consent_date",
  "restart_chronotype", "restart_name",
  "restart_age", "restart_role", "restart_path",
  "restart_sleep", "restart_lifestyle",
  "restart_openness", "restart_whatsapp_asked",
  "restart_launched",
];

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
  letterSpacing: "0.1em",
  marginBottom: 12,
};

const cardBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "16px 20px",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const navBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: 12,
  fontSize: 13,
  fontWeight: 500,
  color: "white",
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.15s",
};

type CardProps = {
  emoji: string;
  title: string;
  subtitle: string;
  hoverBorder: string;
  onClick: () => void;
};

const SimCard = ({ emoji, title, subtitle, hoverBorder, onClick }: CardProps) => (
  <div
    style={cardBase}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      e.currentTarget.style.borderColor = hoverBorder;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = cardBase.background as string;
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
    }}
  >
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
        {emoji} {title}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
        {subtitle}
      </div>
    </div>
    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>→</div>
  </div>
);

const NavButton = ({ label, href }: { label: string; href: string }) => (
  <button
    style={navBtn}
    onClick={() => (window.location.href = href)}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = navBtn.background as string)}
  >
    {label}
  </button>
);

const DevTestPage = () => {
  const newUser = () => {
    RESET_KEYS.forEach((k) => localStorage.removeItem(k));
    window.location.href = "/";
  };

  const day1 = () => {
    localStorage.clear();
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_consent_signed", "true");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Dolphin");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_role", "Working professional");
    localStorage.setItem("restart_day", "1");
    localStorage.setItem("restart_completed_days", JSON.stringify([]));
    localStorage.setItem("restart_streak", "0");
    localStorage.setItem("restart_pro", "false");
    setTimeout(() => {
      window.location.href = "/home";
    }, 100);
  };

  const day3 = () => {
    localStorage.clear();
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_consent_signed", "true");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Dolphin");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_role", "Working professional");
    localStorage.setItem("restart_day", "3");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3]));
    localStorage.setItem("restart_streak", "3");
    localStorage.setItem("restart_pro", "false");
    localStorage.setItem("restart_checkin_state", "overwhelmed");
    localStorage.setItem("restart_checkin_date", new Date().toDateString());
    setTimeout(() => {
      window.location.href = "/journey";
    }, 100);
  };

  const proUser = () => {
    localStorage.clear();
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_consent_signed", "true");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Lion");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_role", "Working professional");
    localStorage.setItem("restart_day", "7");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3, 4, 5, 6, 7]));
    localStorage.setItem("restart_streak", "7");
    localStorage.setItem("restart_pro", "true");
    localStorage.setItem("restart_payment_id", "dev_sim_paid");
    localStorage.setItem("restart_checkin_state", "focused");
    localStorage.setItem("restart_checkin_date", new Date().toDateString());
    setTimeout(() => {
      window.location.href = "/journey";
    }, 100);
  };

  const fullReset = () => {
    if (window.confirm("Clear all localStorage and restart completely?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const formatVal = (k: string) => {
    const v = localStorage.getItem(k);
    if (v === null) return "—";
    return `"${v}"`;
  };

  return (
    <div
      style={{
        background: "#1A2A4A",
        padding: 24,
        minHeight: "100dvh",
        overflowY: "auto",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="logo" style={{ width: 80, margin: "0 auto", display: "block" }} />
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#F5F0A0",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          Dev Testing Panel
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Only visible at /dev-test — never shown to real users
        </p>
      </div>

      <div style={sectionLabel}>SIMULATE USER STATE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SimCard
          emoji="🌱"
          title="New User"
          subtitle="Start from the very beginning — splash screen → onboarding → consent → chronotype → home"
          hoverBorder="rgba(245,240,160,0.4)"
          onClick={newUser}
        />
        <SimCard
          emoji="☀️"
          title="Returning User — Day 1"
          subtitle="Home screen, 0 day streak, no check-in yet today"
          hoverBorder="rgba(123,155,214,0.5)"
          onClick={day1}
        />
        <SimCard
          emoji="🔥"
          title="Day 3 Complete"
          subtitle="3 day streak, mandala 3/7 filled, paywall showing on journey screen"
          hoverBorder="rgba(245,240,160,0.5)"
          onClick={day3}
        />
        <SimCard
          emoji="⭐"
          title="Pro User — Day 7"
          subtitle="All days unlocked, 7 day streak, mandala full, payment complete"
          hoverBorder="rgba(29,158,117,0.4)"
          onClick={proUser}
        />
      </div>

      <div style={{ ...sectionLabel, marginTop: 28 }}>QUICK NAVIGATE</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <NavButton label="🏠 Home" href="/home" />
        <NavButton label="🗓 Journey" href="/journey" />
        <NavButton label="🤖 Didi" href="/checkin" />
        <NavButton label="💳 Pricing" href="/pricing" />
        <NavButton label="👤 Profile" href="/profile" />
        <NavButton label="🔐 Login" href="/" />
      </div>

      <div style={{ ...sectionLabel, marginTop: 28 }}>CURRENT LOCALSTORAGE STATE</div>
      <pre
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 12,
          padding: 16,
          fontSize: 11,
          fontFamily: "monospace",
          color: "#B2FBFF",
          lineHeight: 1.8,
          overflowX: "auto",
          margin: 0,
        }}
      >
        {STATE_KEYS.map((k) => `${k.replace("restart_", "")}: ${formatVal(k)}`).join("\n")}
      </pre>

      <div
        style={{
          ...sectionLabel,
          color: "rgba(255,100,100,0.5)",
          marginTop: 28,
        }}
      >
        DANGER ZONE
      </div>
      <button
        style={{
          width: "100%",
          background: "rgba(231,76,60,0.12)",
          border: "1px solid rgba(231,76,60,0.25)",
          borderRadius: 12,
          padding: 14,
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(231,76,60,0.8)",
          cursor: "pointer",
        }}
        onClick={fullReset}
      >
        🗑 Clear everything — full reset
      </button>

      <p
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          textAlign: "center",
          padding: "24px 0 40px",
        }}
      >
        This page is for development only. Navigate here at /dev-test any time.
      </p>
    </div>
  );
};

export default DevTestPage;