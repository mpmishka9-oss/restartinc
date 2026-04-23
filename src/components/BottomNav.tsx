import { Home, Sparkles, Calendar, User } from "lucide-react";
export type AppTab = "home" | "practices" | "plan" | "profile";

const items = [
  { id: "home" as AppTab, label: "Home", Icon: Home },
  { id: "practices" as AppTab, label: "Practices", Icon: Sparkles },
  { id: "plan" as AppTab, label: "Plan", Icon: Calendar },
  { id: "profile" as AppTab, label: "Profile", Icon: User },
];

const BottomNav = ({ active, onChange }: { active: AppTab; onChange: (t: AppTab) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/30 z-50">
    <div className="max-w-md mx-auto flex justify-around py-2.5">
      {items.map(({ id, label, Icon }) => {
        const a = active === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1 px-4 py-1.5 btn-press relative">
            <Icon className={`w-5 h-5 ${a ? "text-primary" : "text-foreground/35"}`} strokeWidth={1.5} />
            <span className={`text-[10px] font-light ${a ? "text-primary" : "text-foreground/35"}`}>{label}</span>
            {a && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  </nav>
);
export default BottomNav;
