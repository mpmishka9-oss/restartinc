import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/restart-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — welcome back");
      navigate("/");
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
        <h1 className="font-serif text-2xl text-foreground text-center mb-1">Set a new password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {ready ? "Choose something you'll remember." : "Verifying your reset link…"}
        </p>
        {ready && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-primary-deep">New password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-foreground placeholder:text-primary/40"
                placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-primary-deep">Confirm password</label>
              <input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full bg-transparent border-b border-primary/40 focus:border-primary outline-none py-2 text-foreground placeholder:text-primary/40"
                placeholder="Repeat new password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-4 py-3.5 rounded-[16px] bg-accent text-foreground font-medium btn-press flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;