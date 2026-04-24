import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/restart-logo.png";

const AuthScreen = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Welcome to reStart");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a reset link");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something felt off — try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-sky-gradient">
      <img src={logo} alt="reStart" className="w-24 h-24 object-contain mb-6" />
      <div className="w-full max-w-sm glass rounded-[20px] p-7 fade-up">
        <h1 className="font-serif text-2xl text-foreground text-center mb-1">
          {mode === "signup" ? "Begin your reStart" : mode === "signin" ? "Welcome back" : "Reset your password"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "A space that holds you, gently." : mode === "signin" ? "Didi has been waiting." : "We'll send a gentle link to your inbox."}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-primary-deep">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-foreground placeholder:text-primary/40"
              placeholder="you@email.com"
            />
          </div>
          {mode !== "reset" && <div>
            <label className="text-xs uppercase tracking-widest text-primary-deep">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-foreground placeholder:text-primary/40"
              placeholder="At least 6 characters"
            />
          </div>}
          <button type="submit" disabled={loading}
            className="w-full mt-4 py-3.5 rounded-[16px] bg-accent text-foreground font-medium btn-press flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>
        </form>
        {mode === "signin" && (
          <button onClick={() => setMode("reset")}
            className="w-full mt-4 text-xs font-serif italic text-primary-deep">
            Forgot your password?
          </button>
        )}
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-3 text-sm font-serif italic text-primary-deep">
          {mode === "signup" ? "Already have an account? Sign in" : mode === "signin" ? "New here? Begin your reStart" : "Back to sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
