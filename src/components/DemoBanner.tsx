import { isDemoMode, exitDemoMode } from "@/lib/demo";

const DemoBanner = () => {
  if (!isDemoMode()) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(254,255,175,0.92)",
        color: "#1a1a1a",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        padding: "4px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <span>DEMO MODE</span>
      <button
        onClick={exitDemoMode}
        style={{
          background: "transparent",
          border: "none",
          color: "#1a1a1a",
          textDecoration: "underline",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          padding: 0,
        }}
      >
        Exit
      </button>
    </div>
  );
};
export default DemoBanner;
