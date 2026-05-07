import React from "react";

const RESET_KEYS = [
  "restart_day", "restart_completed_days",
  "restart_streak", "restart_pro",
  "restart_checkin_state", "restart_checkin_date",
  "restart_checkin_emotion", "restart_consent_signed",
  "restart_consent_signature", "restart_consent_date",
  "restart_chronotype", "restart_name",
  "restart_age", "restart_role", "restart_path",
  "restart_sleep", "restart_lifestyle",
  "restart_openness", "restart_whatsapp_asked",
  "restart_launched",
];

export const DevToolbar = () => {
  if (!import.meta.env.VITE_RAZORPAY_KEY_ID?.includes("test")) return null;

  const newUser = () => {
    RESET_KEYS.forEach((k) => localStorage.removeItem(k));
    window.location.href = "/onboarding";
  };

  const day1 = () => {
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_day", "1");
    localStorage.setItem("restart_completed_days", JSON.stringify([]));
    localStorage.setItem("restart_streak", "0");
    localStorage.setItem("restart_pro", "false");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Dolphin");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_consent_signed", "true");
    window.location.href = "/home";
  };

  const day3 = () => {
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_day", "3");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3]));
    localStorage.setItem("restart_streak", "3");
    localStorage.setItem("restart_pro", "false");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Dolphin");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_consent_signed", "true");
    localStorage.setItem("restart_checkin_state", "overwhelmed");
    localStorage.setItem("restart_checkin_date", new Date().toDateString());
    window.location.href = "/journey";
  };

  const proUser = () => {
    localStorage.setItem("restart_launched", "true");
    localStorage.setItem("restart_day", "7");
    localStorage.setItem("restart_completed_days", JSON.stringify([1, 2, 3, 4, 5, 6, 7]));
    localStorage.setItem("restart_streak", "7");
    localStorage.setItem("restart_pro", "true");
    localStorage.setItem("restart_payment_id", "dev_simulation");
    localStorage.setItem("restart_name", "Mishka");
    localStorage.setItem("restart_chronotype", "Dolphin");
    localStorage.setItem("restart_path", "ambitious");
    localStorage.setItem("restart_consent_signed", "true");
    localStorage.setItem("restart_checkin_state", "focused");
    localStorage.setItem("restart_checkin_date", new Date().toDateString());
    window.location.href = "/journey";
  };

  const toDidi = () => {
    window.location.href = "/checkin";
  };

  const btnBase: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.18)";
    e.currentTarget.style.color = "white";
  };
  const onLeave = (base: React.CSSProperties) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = base.background as string;
    e.currentTarget.style.color = base.color as string;
  };

  const newUserStyle: React.CSSProperties = {
    ...btnBase,
    borderColor: "rgba(245,240,160,0.4)",
    color: "#F5F0A0",
  };
  const proStyle: React.CSSProperties = {
    ...btnBase,
    borderColor: "rgba(29,158,117,0.4)",
    color: "#5DCAA5",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#1A2A4A",
        borderRadius: 16,
        padding: "10px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          fontWeight: 500,
          letterSpacing: "0.06em",
          marginRight: 4,
        }}
      >
        🛠 Dev
      </span>
      <button style={newUserStyle} onClick={newUser} onMouseEnter={onEnter} onMouseLeave={onLeave(newUserStyle)}>New User</button>
      <button style={btnBase} onClick={day1} onMouseEnter={onEnter} onMouseLeave={onLeave(btnBase)}>Day 1</button>
      <button style={btnBase} onClick={day3} onMouseEnter={onEnter} onMouseLeave={onLeave(btnBase)}>Day 3 ✓</button>
      <button style={proStyle} onClick={proUser} onMouseEnter={onEnter} onMouseLeave={onLeave(proStyle)}>Pro User</button>
      <button style={btnBase} onClick={toDidi} onMouseEnter={onEnter} onMouseLeave={onLeave(btnBase)}>→ Didi</button>
    </div>
  );
};

export default DevToolbar;