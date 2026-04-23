import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { greetingFor, todayPhrase, todayPrompt, CHRONOTYPE_EMOJI, CHRONOTYPE_LABEL, type Chronotype } from "@/lib/restartData";
import Mandala from "./Mandala";
import PracticeCard from "./PracticeCard";

type CheckIn = Tables<"check_ins">;
type Practice = Tables<"practices">;

interface Props { onOpenCheckIn: () => void; onSeePlan: () => void; }

const HomeScreen = ({ onOpenCheckIn, onSeePlan }: Props) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
      const { data: ci } = await supabase.from("check_ins").select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString())
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      setTodayCheckIn(ci ?? null);

      if (ci?.detected_state) {
        const { data: ps } = await supabase.from("practices").select("*")
          .eq("state", ci.detected_state).limit(2);
        setPractices(ps ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-app"><div className="dot-loader"><span/><span/><span/></div></div>;

  const ct = profile?.chronotype as Chronotype | null;
  const hasCheckedIn = !!todayCheckIn;

  return (
    <div className="min-h-screen bg-app pb-32">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, hsl(209 64% 73% / 0.18) 0%, transparent 50%)" }} />
      <div className="relative max-w-md mx-auto px-6 pt-10">
        {/* Greeting */}
        <h1 className="font-serif text-[26px] text-foreground leading-tight">{greetingFor(profile?.name)}</h1>
        <p className="font-serif italic text-[14px] text-primary mt-1">{todayPhrase()}</p>
        {ct && (
          <p className="text-[12px] text-primary-deep/70 font-light mt-2">
            {CHRONOTYPE_EMOJI[ct]} {CHRONOTYPE_LABEL[ct]}
          </p>
        )}

        {/* Check-in card */}
        <div className="mt-8 glass rounded-[20px] p-5 border border-primary/30 fade-up">
          {!hasCheckedIn ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary-deep font-medium">Today's check-in</p>
              <p className="font-serif italic text-[17px] text-foreground mt-2 leading-snug">{todayPrompt()}</p>
              <button onClick={onOpenCheckIn}
                className="w-full mt-4 py-3 rounded-[16px] bg-primary text-white font-medium btn-press pulse-soft">
                Open today's check-in
              </button>
            </>
          ) : (
            <div className="bg-accent/20 -m-5 p-5 rounded-[20px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif italic text-foreground text-[16px]">You've checked in today.</p>
              </div>
              {todayCheckIn?.detected_state && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full glass-strong text-[11px] text-foreground capitalize">
                  Feeling: {todayCheckIn.detected_state}
                </span>
              )}
              <p className="text-[13px] font-light text-foreground/70 mt-3">Didi's got you.</p>
            </div>
          )}
        </div>

        {/* Inner garden */}
        {hasCheckedIn && (
          <div className="mt-10 flex flex-col items-center fade-up">
            <p className="text-[10px] uppercase tracking-[0.15em] text-primary-deep font-medium">Your inner garden</p>
            <div className="my-4">
              <Mandala count={profile?.completed_practices ?? 0} size={200} />
            </div>
            <p className="text-[12px] text-primary-deep/70 font-light">
              {profile?.completed_practices ?? 0} practices completed
            </p>
          </div>
        )}

        {/* Today's practices */}
        {hasCheckedIn && practices.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-foreground font-medium mb-3">Today's practices</p>
            <div className="space-y-3">
              {practices.map(p => (
                <PracticeCard key={p.id} practice={p} level={(todayCheckIn?.assigned_level ?? 1) as 1|2|3} chronotype={ct} />
              ))}
            </div>
            <button onClick={onSeePlan} className="mt-4 text-sm text-primary-deep btn-press">See full plan →</button>
          </div>
        )}

        {/* Empty state */}
        {!hasCheckedIn && (
          <p className="font-serif italic text-primary text-[15px] text-center mt-8 fade-up">
            This is your space, {profile?.name?.trim() || "friend"}.<br/>Start whenever you're ready.
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
