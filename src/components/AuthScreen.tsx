import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
 import { lovable } from "@/integrations/lovable";
import logo from "@/assets/logo.png";

const AuthScreen = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

   const googleSignIn = async () => {
     setLoading(true);
     try {
       const { error } = await lovable.auth.signInWithOAuth("google");
       if (error) throw error;
     } catch (err: any) {
       toast.error(err.message ?? "Google sign-in failed");
     } finally {
       setLoading(false);
     }
   };
 
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
       {mode !== "reset" && (
         <>
           <div className="flex items-center gap-3 my-5">
             <div className="flex-1 h-[1px] bg-white/10" />
             <span className="text-[11px] text-white/40 uppercase tracking-widest">or</span>
             <div className="flex-1 h-[1px] bg-white/10" />
           </div>
           <button
             onClick={googleSignIn}
             disabled={loading}
             className="w-full py-3.5 rounded-xl border border-white/20 text-white text-[14px] flex items-center justify-center gap-3 hover:bg-white/5 disabled:opacity-50"
           >
             <svg viewBox="0 0 24 24" className="w-5 h-5">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" fill="#EA4335"/>
             </svg>
             Continue with Google
           </button>
         </>
       )}
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
