import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { CHRONOTYPE_EMOJI, CHRONOTYPE_LABEL, type Chronotype } from "@/lib/restartData";
import Mandala from "./Mandala";

const Row = ({ label, onClick, danger, icon }: { label: string; onClick?: () => void; danger?: boolean; icon?: React.ReactNode }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between py-4 border-b border-primary/10 btn-press">
    <span className={`text-sm ${danger ? "text-destructive" : "text-foreground"}`}>{label}</span>
    {icon ?? <ChevronRight className="w-4 h-4 text-foreground/40" />}
  </button>
);

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const ct = (profile?.chronotype ?? null) as Chronotype | null;

  return (
    <div className="min-h-screen pb-32 px-6 pt-12 bg-app">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="text-[56px] mb-2">{ct ? CHRONOTYPE_EMOJI[ct] : "🌿"}</div>
        <h1 className="font-serif text-2xl text-foreground">{profile?.name?.trim() || "friend"}</h1>
        <p className="text-sm text-primary-deep font-light mt-1">{ct ? CHRONOTYPE_LABEL[ct] : ""}</p>

        <div className="mt-6"><Mandala count={profile?.completed_practices ?? 0} size={160} /></div>
        <p className="text-[12px] text-primary-deep/70 font-light mt-2">
          {profile?.completed_practices ?? 0} practices completed
        </p>

        <div className="w-full mt-10 glass rounded-[20px] px-5">
          <Row label={`Path · ${profile?.path === "ambitious" ? "Performing" : "Emotional"}`} />
          <Row label="Notification preferences" />
          <Row label="About reStart" />
          <Row label="Privacy policy" />
          <Row label="Sign out" danger onClick={signOut} icon={<LogOut className="w-4 h-4 text-destructive" />} />
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
