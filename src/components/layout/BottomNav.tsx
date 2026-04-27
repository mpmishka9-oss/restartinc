import { Home, Calendar, Sparkles, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/journey", label: "Journey", Icon: Calendar },
  { to: "/practices", label: "Practices", Icon: Sparkles },
  { to: "/profile", label: "Profile", Icon: User },
];

const BottomNav = () => {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-rs-navy/90 backdrop-blur-xl border-t border-white/10">
      <div className="phone-frame !min-h-0 flex justify-around py-2.5">
        {items.map(({ to, label, Icon }) => {
          const a = loc.pathname === to || (to === "/home" && loc.pathname === "/");
          return (
            <button key={to} onClick={() => nav(to)} className="flex flex-col items-center gap-1 px-3 py-1.5 btn-press">
              <Icon className="w-5 h-5" strokeWidth={1.6} style={{ color: a ? "hsl(var(--rs-cream))" : "rgba(255,255,255,0.5)" }} />
              <span className="text-[10px] font-medium" style={{ color: a ? "hsl(var(--rs-cream))" : "rgba(255,255,255,0.5)" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNav;
