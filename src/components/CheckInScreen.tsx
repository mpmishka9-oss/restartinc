import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { todayPrompt, levelPoetic } from "@/lib/restartData";
import { toast } from "sonner";

interface Props { onDone: () => void; onSeePractices: () => void; }

const CheckInScreen = ({ onDone, onSeePractices }: Props) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const submit = async () => {
    if (!message.trim() || !user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-in", {
        body: { message, path: profile?.path ?? "emotional", onboarding_answers: profile?.onboarding_answers ?? {} },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResponse(data);

      await supabase.from("check_ins").insert({
        user_id: user.id,
        message,
        didi_response: data.warm,
        detected_state: data.detected_state,
        severity_score: data.severity_score,
        assigned_level: data.assigned_level,
        dosha: data.dosha,
        level_description: data.level_description,
        practices_shown: data.suggested_practices ?? [],
      });
    } catch (e: any) {
      toast.error(e.message ?? "Something felt off — try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 pb-32 bg-deep-gradient">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
        <p className="text-white/70 text-xs tracking-widest uppercase mb-1">reStart</p>
        <h1 className="font-serif text-white text-[22px]">Hey {profile?.name?.trim() || "friend"}</h1>
        <p className="font-serif italic text-white text-[18px] mt-4 leading-snug">{todayPrompt()}</p>

        {!response && (
          <div className="mt-6 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              placeholder="Whatever's on your mind…"
              className="w-full bg-transparent border-b border-white/30 focus:border-white/70 outline-none py-3 text-white placeholder:text-white/40 text-[15px] leading-loose resize-none"
            />
            <button onClick={submit} disabled={loading || !message.trim()}
              className="absolute right-0 -bottom-2 translate-y-full w-12 h-12 rounded-full bg-accent text-foreground flex items-center justify-center btn-press disabled:opacity-50"
              style={{ transition: "transform 400ms" }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "rotate(360deg)"; }}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-16 flex flex-col items-center">
            <div className="dot-loader mb-3"><span/><span/><span/></div>
            <p className="font-serif italic text-white">Didi is here…</p>
          </div>
        )}

        {response && (
          <div className="mt-10 fade-up">
            <div className="glass-strong rounded-[20px] p-6">
              <p className="font-serif italic text-foreground text-[16px] leading-relaxed whitespace-pre-wrap">
                {response.warm}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {response.detected_state && (
                  <span className="px-3 py-1 rounded-full bg-accent text-foreground text-[11px]">
                    Today feels like: <span className="capitalize">{response.detected_state}</span>
                  </span>
                )}
              </div>
              {response.assigned_level && (
                <p className="text-[12px] text-primary-deep/80 font-light mt-3 italic">
                  {response.level_description ?? levelPoetic[response.assigned_level]}
                </p>
              )}
            </div>
            <button onClick={onSeePractices}
              className="mt-6 w-full py-3.5 rounded-[16px] bg-accent text-foreground font-medium btn-press flex items-center justify-center gap-2 fade-up"
              style={{ animationDelay: "300ms" }}>
              See today's practices <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onDone} className="mt-3 w-full text-white/80 text-sm">Back home</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInScreen;
