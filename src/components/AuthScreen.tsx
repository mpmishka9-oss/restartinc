import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/restart-logo.png";

const AuthScreen = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
          {mode === "signup" ? "Begin your reStart" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "A space that holds you, gently." : "Didi has been waiting."}
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
          <div>
            <label className="text-xs uppercase tracking-widest text-primary-deep">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-foreground placeholder:text-primary/40"
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-4 py-3.5 rounded-[16px] bg-accent text-foreground font-medium btn-press flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-5 text-sm font-serif italic text-primary-deep">
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Begin your reStart"}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
