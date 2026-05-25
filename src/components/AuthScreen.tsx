import { useState } from "react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-new.png";
import authBg from "@/assets/auth-bg.jpeg";

const AuthScreen = () => {
  const [loading, setLoading] = useState<null | "google" | "apple">(null);
  const showDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "true";

  const demoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "restartuser.wolf@gmail.com",
        password: "Restart@2024",
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? "Demo login failed");
    }
  };

  const oauthSignIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider);
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? `${provider} sign-in failed`);
    } finally {
      setLoading(null);
    }
  };

  const buttonStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: 14,
    color: "#1A2A4A",
    fontSize: 14,
    fontWeight: 600,
    padding: 14,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    cursor: "pointer",
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
      {showDemo && (
        <button
          onClick={demoLogin}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#FEFFAF",
            color: "#1a1a1a",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            zIndex: 50,
          }}
        >
          Demo
        </button>
      )}
      <div style={{ background: "transparent", border: "none", marginBottom: 24 }} className="flex flex-col items-center">
        <img src={logo} alt="reStart" className="object-cover text-xl" style={{ width: 160, background: "transparent" }} />
        <div style={{ background: "rgba(26, 42, 74, 0.06)", padding: "8px 0", width: "100%", marginTop: 8, textAlign: "center" }}>
          <p className="font-serif text-rs-navy bg-transparent" style={{ color: "#1A2A4A", opacity: 1, fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", textShadow: "none", textTransform: "uppercase", margin: 0 }}>
            Rewiring your mind to match your ambition - Neuroplasticity | Ayurveda
          </p>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 24,
          padding: "32px 28px",
        }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={() => oauthSignIn("google")}
          disabled={loading !== null}
          style={{ ...buttonStyle, opacity: loading && loading !== "google" ? 0.5 : 1 }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};
export default AuthScreen;
