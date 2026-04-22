import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  userId: string;
  daysSinceSignup: number;
  streakDays: number;
  onComplete: (result: {
    detected_state: string;
    assigned_level: number;
  }) => void;
}

const CheckInScreen = ({ userId, daysSinceSignup, streakDays, onComplete }: Props) => {
  const [message, setMessage] = useState("");
  const [warm, setWarm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setWarm(null);
    try {
      const { data, error } = await supabase.functions.invoke("check-in", {
        body: { message, days_since_signup: daysSinceSignup, streak_days: streakDays },
      });
      if (error) throw error;
      setWarm(data.warm_response);
      setResult(data);

      const { error: insErr } = await supabase.from("check_ins").insert({
        user_id: userId,
        message,
        warm_response: data.warm_response,
        detected_state: data.detected_state,
        severity_score: data.severity_score,
        assigned_level: data.assigned_level,
        dosha: data.dosha,
        suggested_practice_types: data.suggested_practice_types,
      });
      if (insErr) console.error(insErr);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach Didi. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 pb-28"
      style={{ background: "linear-gradient(180deg, hsl(220, 80%, 78%) 0%, hsl(195, 70%, 78%) 100%)" }}>
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mb-1">How are you, really?</h1>
        <p className="text-xs text-muted-foreground mb-6">Didi is listening — share what's on your mind.</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!!warm}
          rows={5}
          placeholder="I've been feeling..."
          className="w-full px-5 py-4 rounded-2xl bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
        />

        {!warm && (
          <button
            onClick={submit}
            disabled={loading || !message.trim()}
            className="w-full py-4 rounded-2xl bg-foreground text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Didi is reflecting..." : "Share with Didi"}
          </button>
        )}

        {warm && (
          <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-5 border border-border/50">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Didi</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{warm}</p>
            </div>
            <button
              onClick={() => onComplete({ detected_state: result.detected_state, assigned_level: result.assigned_level })}
              className="w-full py-4 rounded-2xl bg-foreground text-primary-foreground font-semibold"
            >
              See my 3-day plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInScreen;