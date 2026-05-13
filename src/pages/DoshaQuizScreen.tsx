import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import DoshaQuiz from "@/components/onboarding/DoshaQuiz";
import type { Dosha } from "@/data/practices";
import { isDemoMode } from "@/lib/demo";

const DoshaQuizScreen = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { update } = useProfile();

  return (
    <DoshaQuiz
      onComplete={async (dosha: Dosha) => {
        if (isDemoMode()) {
          await update({ dosha } as any);
        } else if (user) {
          const { error } = await supabase.from("profiles").update({ dosha }).eq("id", user.id);
          if (error) { toast.error("Couldn't save — try again."); return; }
        }
        try { localStorage.setItem("restart_dosha_prompt_dismissed", "1"); } catch {}
        toast.success("Dosha saved");
        nav("/journey");
      }}
    />
  );
};

export default DoshaQuizScreen;
