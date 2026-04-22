import { Heart, Calendar, Sparkles } from "lucide-react";

export type AppTab = "checkin" | "plan" | "practices";

const BottomNav = ({ active, onChange }: { active: AppTab; onChange: (t: AppTab) => void }) => {
  const items: { id: AppTab; label: string; Icon: typeof Heart }[] = [
    { id: "checkin", label: "Check-in", Icon: Heart },
    { id: "plan", label: "Plan", Icon: Calendar },
    { id: "practices", label: "Practices", Icon: Sparkles },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border/50 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {items.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
              active === id ? "text-foreground" : "text-muted-foreground"
            }`}>
            <Icon className={`w-5 h-5 ${active === id ? "fill-foreground/10" : ""}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;