import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
 import { lovable } from "@/integrations/lovable";
import logo from "@/assets/logo-new.png";
import authBg from "@/assets/auth-bg.jpeg";

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

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: 12,
    color: "#1A2A4A",
    fontSize: 14,
    padding: "12px 16px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100dvh",
      }}
    >
      <style>{`.auth-input::placeholder{color:rgba(26,42,74,0.4);}`}</style>
      <div style={{ background: "transparent", border: "none", marginBottom: 24 }} className="flex flex-col items-center">
        <img src={logo} alt="reStart" className="object-cover text-xl" style={{ width: 160, background: "transparent" }} />
        <div style={{ background: "rgba(26, 42, 74, 0.06)", padding: "8px 0", width: "100%", marginTop: 8, textAlign: "center" }}>
          <p className="font-serif" style={{ color: "#1A2A4A", opacity: 1, fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textShadow: "none", textTransform: "uppercase", margin: 0 }}>
            Rewiring your mind to match your ambition - Neuroplasticity | Ayurveda
          </p>
        </div>
      </div>
      <div className="bg-rs-cream"
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "none",
        }}
      >
        <h2 style={{ color: "#1A2A4A", fontWeight: 700, fontSize: 22, textAlign: "center", margin: 0 }}>
          {mode === "signup" ? "Begin your reStart" : mode === "signin" ? "Welcome back" : "Reset your password"}
        </h2>
        <p style={{ color: "rgba(26,42,74,0.6)", fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 20 }}>
          {mode === "signup" ? "A space that holds you, gently." : mode === "signin" ? "Didi has been waiting." : "We'll send a gentle link."}
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input className="auth-input" type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com" style={inputStyle} />
          {mode !== "reset" && (
            <input className="auth-input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters" style={inputStyle} />
          )}
          <button type="submit" disabled={loading}
            style={{
              background: "#F5F0A0",
              color: "#1A2A4A",
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 14,
              border: "none",
              padding: 14,
              width: "100%",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>
        </form>
       {mode !== "reset" && (
         <>
           <div className="flex items-center gap-3 my-5">
             <div className="flex-1 h-[1px]" style={{ background: "rgba(26,42,74,0.15)" }} />
             <span style={{ fontSize: 11, color: "rgba(26,42,74,0.5)", textTransform: "uppercase", letterSpacing: "0.15em" }}>or</span>
             <div className="flex-1 h-[1px]" style={{ background: "rgba(26,42,74,0.15)" }} />
           </div>
           <button
             onClick={googleSignIn}
             disabled={loading}
             style={{
               background: "rgba(255,255,255,0.5)",
               border: "1px solid rgba(255,255,255,0.5)",
               borderRadius: 14,
               color: "#1A2A4A",
               fontSize: 14,
               padding: 12,
               width: "100%",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               gap: 12,
               cursor: loading ? "not-allowed" : "pointer",
               opacity: loading ? 0.5 : 1,
             }}
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
          <button onClick={() => setMode("reset")} className="w-full mt-3" style={{ fontSize: 13, color: "#1A2A4A", opacity: 0.6 }}>Forgot your password?</button>
        )}
        <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-2" style={{ fontSize: 13, color: "#1A2A4A", opacity: 0.6 }}>
          {mode === "signup" ? "Already have an account? Sign in" : mode === "signin" ? "New here? Begin your reStart" : "Back to sign in"}
        </button>
      </div>
    </div>
  );
};
export default AuthScreen;
