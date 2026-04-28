import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const AuthScreen = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password,
          options: { emailRedirectTo: `${window.location.origin}/` } });
        if (error) throw error;
        toast.success("Welcome to reStart");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Check your email for a reset link");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something felt off — try again?");
    } finally { setLoading(false); }
  };

  return (
    <div className="phone-frame min-h-screen flex flex-col items-center justify-center px-6">
      <img src={logo} alt="reStart" style={{ width: 220, objectFit: "contain" }} />
      <p className="text-[11px] tracking-[0.2em] uppercase text-white/55 mb-8">Ancient Wisdom · Modern Science</p>
      <div className="w-full max-w-sm rounded-2xl glass p-6">
        <h2 className="text-white text-[20px] font-bold text-center">
          {mode === "signup" ? "Begin your reStart" : mode === "signin" ? "Welcome back" : "Reset your password"}
        </h2>
        <p className="text-[13px] text-rs-muted text-center mt-1 mb-5">
          {mode === "signup" ? "A space that holds you, gently." : mode === "signin" ? "Didi has been waiting." : "We'll send a gentle link."}
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-rs-cream" />
          {mode !== "reset" && (
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-rs-cream" />
          )}
          <button type="submit" disabled={loading}
            className="w-full mt-2 py-3.5 btn-cream flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>
        </form>
        {mode === "signin" && (
          <button onClick={() => setMode("reset")} className="w-full mt-3 text-[12px] text-rs-cream">Forgot your password?</button>
        )}
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-2 text-[13px] text-rs-muted">
          {mode === "signup" ? "Already have an account? Sign in" : mode === "signin" ? "New here? Begin your reStart" : "Back to sign in"}
        </button>
      </div>
    </div>
  );
};
export default AuthScreen;
